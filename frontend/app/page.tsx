"use client";

import { sanctumRequest  } from "@/components/config/sanctumRequest";
import { Button } from "@/components/ui/button";

export default function Home() {

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

      const response = await sanctumRequest(
    'post',
    `${process.env.NEXT_PUBLIC_URL}/api/login`,
    { email: "paula.buendia@example.com", password: "contrasena"}
    );

    if (response.data.status === 'true') {
    localStorage.setItem('isAuthenticated', 'true');
    alert("User logged in successfully!");

}
};

  return (
    <div style={{ padding: "50px" }}>
      <h1>hola este es el frontend</h1>
      
      <form onSubmit={handleLogin}>
        <Button type="submit">Enviar Login</Button>
      </form>       
    </div>
  );
}