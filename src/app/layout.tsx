import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CalSaaS - Reserva de Reuniones y Agendamiento Inteligente",
  description: "Plataforma moderna de agendamiento y reserva de reuniones con sincronización en tiempo real con Google Calendar y Google Meet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0f172a",
              color: "#ffffff",
              borderRadius: "1rem",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)",
            },
          }}
        />
      </body>
    </html>
  );
}
