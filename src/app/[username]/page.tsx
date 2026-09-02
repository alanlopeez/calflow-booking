import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Video, ChevronRight, Calendar, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function UserProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const user = await prisma.user.findUnique({
    where: { username: params.username },
    include: {
      eventTypes: {
        where: { isActive: true },
        orderBy: { duration: "asc" },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Host Header */}
        <div className="text-center space-y-4">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || "Host"}
              width={80}
              height={80}
              className="rounded-full mx-auto border-2 border-white shadow-md"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-slate-950 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
              {user.name?.[0] || "U"}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950">
              {user.name}
            </h1>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              @{user.username}
            </p>
          </div>

          {user.bio && (
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {user.bio}
            </p>
          )}
        </div>

        {/* Event Types List */}
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Selecciona un tipo de reunión
          </p>

          {user.eventTypes.length === 0 ? (
            <Card className="p-8 text-center text-slate-500 text-sm">
              Este usuario no tiene tipos de eventos activos en este momento.
            </Card>
          ) : (
            user.eventTypes.map((event) => (
              <Link
                key={event.id}
                href={`/${user.username}/${event.slug}`}
                className="block group"
              >
                <Card className="p-5 hover:border-slate-400 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="h-10 w-10 rounded-2xl flex items-center justify-center text-white font-bold shrink-0 shadow-sm"
                        style={{ backgroundColor: event.color }}
                      >
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{event.duration} min</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3 text-blue-600" /> Google Meet
                          </span>
                        </p>
                      </div>
                    </div>

                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>

        {/* Footer Brand */}
        <div className="text-center pt-8 border-t border-slate-200/60">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 transition-colors font-semibold"
          >
            <span>Powered by</span>
            <span className="font-extrabold text-slate-900">CalFlow.</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
