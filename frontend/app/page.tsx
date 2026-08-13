"use client";

import axios from "axios";
import { Button } from "@/components/ui/button";

// Creamos una instancia dedicada para conectar con Laravel
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL || "http://localhost:8000",
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

export default function Home() {
  const formdata = {
    email: "paula.buendia@example.com",
    password: "contrasena",
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // 1. Pedir la cookie CSRF
      await api.get("/sanctum/csrf-cookie");

      // 2. Hacer el POST al login de Fortify
      const response = await api.post("/login", formdata);

      console.log("Success! 🎉 User logged in:", response.data);
      alert("User logged in successfully!");
      
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Status:", error.response?.status);
        console.error("Data:", error.response?.data);
      }
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