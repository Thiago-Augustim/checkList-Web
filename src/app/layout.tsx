import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CheckList Frota — Painel do Gestor",
  description:
    "Sistema de Gestão de Vistorias de Frota e Formulários Dinâmicos (Offline-First)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
