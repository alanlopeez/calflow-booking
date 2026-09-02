"use client";

import { useState } from "react";
import { User, Globe, Save, CheckCircle2, ShieldCheck, Mail, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { updateUserProfile } from "@/actions/user";
import { toast } from "sonner";

interface UserProfileData {
  name: string;
  email: string;
  username: string;
  bio: string | null;
  timeZone: string;
  image: string | null;
}

const TIMEZONES = [
  "America/Mexico_City",
  "America/Bogota",
  "America/Argentina/Buenos_Aires",
  "America/Santiago",
  "America/Lima",
  "America/New_York",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Europe/Madrid",
  "UTC",
];

export function SettingsForm({ initialData }: { initialData: UserProfileData }) {
  const [name, setName] = useState(initialData.name || "");
  const [username, setUsername] = useState(initialData.username || "");
  const [bio, setBio] = useState(initialData.bio || "");
  const [timeZone, setTimeZone] = useState(initialData.timeZone || "America/Mexico_City");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name,
        username,
        bio,
        timeZone,
      });
      toast.success("Perfil y enlace actualizados correctamente.");
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar perfil");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
          Ajustes de la Cuenta
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Personaliza tu perfil público, nombre de usuario y configuración regional.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details */}
        <Card className="p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-900">Perfil Público</h3>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Nombre Completo *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre y apellido"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Nombre de Usuario / Slug de Enlace *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">calflow.io/</span>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                placeholder="tu-nombre"
                required
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Esta es la dirección web que tus clientes verán para agendar reuniones contigo.
            </p>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Biografía o Descripción Corta
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Escribe unas palabras sobre tu experiencia o los temas que abordas..."
              rows={3}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">
              Zona Horaria Predeterminada
            </label>
            <select
              value={timeZone}
              onChange={(e) => setTimeZone(e.target.value)}
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-sm"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Google OAuth Connection Card */}
        <Card className="p-6 space-y-3 bg-slate-50 border-slate-200/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-900">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Google Calendar Conectado</h4>
                <p className="text-xs text-slate-500">{initialData.email}</p>
              </div>
            </div>

            <Badge variant="success">Sincronizado</Badge>
          </div>
          <p className="text-xs text-slate-500">
            Tu cuenta está autorizada para sincronizar disponibilidad y generar salas de Google Meet de manera segura.
          </p>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl gap-2 font-bold shadow-md bg-slate-950 hover:bg-black text-white px-8"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Guardando..." : "Guardar Cambios"}</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
