import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:8000";

/**
 * Proxy route handler.
 * Forwards requests from /api/proxy/[...path] to the Laravel backend server-to-server.
 * This bypasses browser CORS restrictions entirely.
 *
 * Key behavior:
 * - Uses redirect: "manual" so Laravel's 302 responses never reach the browser.
 * - Converts any 3xx response to 200 and returns the body (or empty JSON).
 * - Forwards Set-Cookie headers back so the session cookie is preserved.
 */
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const segments = resolvedParams.path ?? [];
  const path = segments.join("/");

  const searchParams = request.nextUrl.searchParams.toString();
  const fullUrl = searchParams
    ? `${BACKEND_URL}/${path}?${searchParams}`
    : `${BACKEND_URL}/${path}`;

  // Build headers to forward — force JSON so Laravel's wantsJson() is always true
  const forwardedHeaders = new Headers();
  forwardedHeaders.set("Accept", "application/json");
  forwardedHeaders.set("Content-Type", "application/json");
  forwardedHeaders.set("X-Requested-With", "XMLHttpRequest");
  forwardedHeaders.set("Origin", "http://localhost:3000");
  forwardedHeaders.set("Referer", "http://localhost:3000/");

  // Forward auth and CSRF tokens when present
  const authorization = request.headers.get("authorization");
  if (authorization) {
    forwardedHeaders.set("Authorization", authorization);
  }

  const xsrf = request.headers.get("x-xsrf-token");
  if (xsrf) {
    forwardedHeaders.set("X-XSRF-TOKEN", xsrf);
  }

  // Forward cookies so Sanctum session works
  const cookie = request.headers.get("cookie");
  if (cookie) {
    forwardedHeaders.set("Cookie", cookie);
  }

  // Read request body for mutating methods
  let body: string | undefined;
  if (!["GET", "HEAD"].includes(request.method)) {
    body = await request.text();
  }

  // Perform the backend request — redirect: "manual" intercepts any 3xx from Laravel
  const backendResponse = await fetch(fullUrl, {
    method: request.method,
    headers: forwardedHeaders,
    body: body || undefined,
    redirect: "manual",
  });

  // Read the raw response text
  const responseText = await backendResponse.text();

  // Build response headers
  const responseHeaders = new Headers();
  responseHeaders.set("Content-Type", "application/json");

  // Pass all Set-Cookie headers back so the session cookie reaches the browser
  backendResponse.headers.forEach((value, key) => {
    if (key.toLowerCase() === "set-cookie") {
      responseHeaders.append("Set-Cookie", value);
    }
  });

  // Handle empty bodies or 204 No Content cleanly
  if (backendResponse.status === 204 || !responseText || responseText.trim() === "") {
    const emptyStatus = backendResponse.status >= 300 && backendResponse.status < 400 ? 200 : backendResponse.status;
    return new NextResponse(null, { status: emptyStatus, headers: responseHeaders });
  }

  // Parse JSON safely
  let jsonBody: unknown;
  try {
    jsonBody = JSON.parse(responseText);
  } catch {
    jsonBody = { raw: responseText };
  }

  // Determine the status to send to the browser
  // Any 3xx from Laravel (Fortify redirects) is absorbed and treated as 200
  const isRedirect =
    backendResponse.status >= 300 && backendResponse.status < 400;
  const status = isRedirect ? 200 : backendResponse.status;

  return NextResponse.json(jsonBody, { status, headers: responseHeaders });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const OPTIONS = handler;
