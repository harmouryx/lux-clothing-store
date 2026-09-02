"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { User } from "@/lib/types";
import { getUsers } from "@/lib/services/users";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2Icon, UsersIcon, SearchIcon, ShieldCheckIcon, ShieldIcon, ShoppingBagIcon, CheckCircle2Icon, CircleDashedIcon, RefreshCwIcon } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { toast } from "sonner";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: string }) {
  const isAdmin = role.toLowerCase() === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono uppercase tracking-wider ${
        isAdmin
          ? "bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
      }`}
    >
      {isAdmin ? <ShieldCheckIcon className="size-2.5" /> : <ShieldIcon className="size-2.5" />}
      {role}
    </span>
  );
}

export default function DashboardUsersPage() {
  const { lang } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const label = (es: string, en: string) => (lang === "ES" ? es : en);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      toast.error(label("Error al cargar usuarios", "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        (u.last_name ?? "").toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, search]);

  const totalAdmins = users.filter((u) => {
    const roles = u.roles ?? [];
    return roles.some((r) => (typeof r === "string" ? r : r.name).toLowerCase() === "admin");
  }).length;

  const totalWith2FA = users.filter((u) => !!u.two_factor_confirmed_at).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="size-5 text-violet-600" />
            <h2 className="text-lg font-bold text-foreground">
              {label("Usuarios Registrados", "Registered Users")}
            </h2>
          </div>
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCwIcon className={`size-3 ${loading ? "animate-spin" : ""}`} />
            {label("Actualizar", "Refresh")}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {label(
            "Gestiona todos los usuarios registrados en la plataforma LUX.",
            "Manage all users registered on the LUX platform."
          )}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: label("Total Usuarios", "Total Users"), value: users.length, icon: <UsersIcon className="size-4 text-violet-500" /> },
          { label: label("Administradores", "Admins"), value: totalAdmins, icon: <ShieldCheckIcon className="size-4 text-violet-500" /> },
          { label: label("Clientes", "Customers"), value: users.length - totalAdmins, icon: <ShieldIcon className="size-4 text-slate-500" /> },
          { label: label("2FA Activo", "2FA Active"), value: totalWith2FA, icon: <CheckCircle2Icon className="size-4 text-emerald-500" /> },
        ].map((card) => (
          <Card key={card.label} className="border shadow-xs">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{card.label}</p>
                <p className="text-2xl font-bold font-mono tabular-nums text-foreground">
                  {loading ? "—" : card.value}
                </p>
              </div>
              {card.icon}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border shadow-xs overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/20">
          <SearchIcon className="size-3.5 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={label("Buscar por nombre o email...", "Search by name or email...")}
            className="h-7 border-0 bg-transparent text-xs shadow-none focus-visible:ring-0 p-0"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer">
              {label("Limpiar", "Clear")}
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table className="w-full border-collapse">
            <TableHeader className="bg-muted/40 border-b">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground w-12">#ID</TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">{label("Nombre", "Name")}</TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">{label("Correo", "Email")}</TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">{label("Rol", "Role")}</TableHead>
                <TableHead className="px-4 py-3 text-center font-semibold text-xs text-muted-foreground">2FA</TableHead>
                <TableHead className="px-4 py-3 text-center font-semibold text-xs text-muted-foreground">{label("Ordenes", "Orders")}</TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold text-xs text-muted-foreground">{label("Registrado", "Joined")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    <Loader2Icon className="size-4 animate-spin mx-auto mb-1.5" />
                    {label("Cargando usuarios...", "Loading users...")}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    {search ? label("Sin resultados para la busqueda.", "No results found.") : label("No hay usuarios registrados.", "No users registered yet.")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => {
                  const roles = (user.roles ?? []) as Array<string | { name: string }>;
                  const roleNames = roles.map((r) => (typeof r === "string" ? r : r.name));
                  const has2FA = !!user.two_factor_confirmed_at;
                  return (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="px-4 py-3 font-mono text-xs text-muted-foreground">{user.id}</TableCell>
                      <TableCell className="px-4 py-3 font-semibold text-xs text-foreground">{user.name} {user.last_name ?? ""}</TableCell>
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground font-mono">{user.email}</TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {roleNames.length > 0 ? roleNames.map((r) => <RoleBadge key={r} role={r} />) : <span className="text-xs text-muted-foreground">-</span>}
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        {has2FA ? <CheckCircle2Icon className="size-4 text-emerald-500 mx-auto" /> : <CircleDashedIcon className="size-4 text-muted-foreground mx-auto" />}
                      </TableCell>
                      <TableCell className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-foreground">
                          <ShoppingBagIcon className="size-3 text-muted-foreground" />
                          {user.orders_count ?? 0}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-xs text-muted-foreground">{formatDate(user.created_at)}</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t bg-muted/10 text-xs text-muted-foreground">
            {label(`Mostrando ${filtered.length} de ${users.length} usuarios`, `Showing ${filtered.length} of ${users.length} users`)}
          </div>
        )}
      </Card>
    </div>
  );
}
