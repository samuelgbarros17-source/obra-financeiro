import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obra Financeiro MVP",
  description: "Controle financeiro de obras por categoria",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  );
}
