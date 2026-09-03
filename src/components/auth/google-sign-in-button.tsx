"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleSignIn}
      disabled={loading}
      variant="default"
      size="lg"
      className="w-full rounded-2xl py-6 flex items-center justify-center gap-3 bg-slate-950 text-white hover:bg-black font-bold shadow-md active:scale-[0.98] transition-all disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          <span>Conectando con Google...</span>
        </>
      ) : (
        <>
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.54 0 2.94.55 4.04 1.45l3.03-3.03C17.2 1.7 14.77 1 12 1 7.37 1 3.44 3.78 1.63 7.78l3.66 2.84C6.18 7.35 8.84 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.71 2.88c2.17-2 3.71-4.96 3.71-8.7z"
            />
            <path
              fill="#FBBC05"
              d="M5.29 14.62c-.24-.72-.37-1.49-.37-2.28s.13-1.56.37-2.28L1.63 7.22C.59 9.3.01 11.6.01 14s.58 4.7 1.62 6.78l3.66-2.84z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.71-2.88c-1.08.72-2.45 1.16-4.22 1.16-3.16 0-5.82-2.35-6.71-5.62L1.63 15.6C3.44 19.6 7.37 23 12 23z"
            />
          </svg>
          <span>Continuar con Google</span>
        </>
      )}
    </Button>
  );
}
