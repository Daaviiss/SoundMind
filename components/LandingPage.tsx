"use client";

import { signIn } from "next-auth/react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">SoundMind</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        {/* Pill */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#161616] px-4 py-1.5 text-sm text-[#a3a3a3]">
          <span className="w-2 h-2 rounded-full bg-[#1DB954] animate-pulse inline-block" />
          Tu identidad musical, revelada
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-tight max-w-3xl mb-6">
          Tu música dice<br />
          <span className="text-[#1DB954]">más de ti</span><br />
          de lo que crees
        </h1>

        <p className="text-[#a3a3a3] text-lg sm:text-xl max-w-lg mb-12 leading-relaxed">
          Tu Spotify sabe cosas de ti que no te has parado a pensar.<br className="hidden sm:block" />
          Nosotros te las contamos.
        </p>

        <button
          onClick={() => signIn("spotify", { callbackUrl: "/dashboard" })}
          className="group flex items-center gap-3 bg-[#1DB954] hover:bg-[#17a348] text-black font-semibold px-8 py-4 rounded-full text-base transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-[#1DB954]/20"
        >
          <SpotifyIcon />
          Conectar con Spotify
        </button>

        <p className="mt-4 text-xs text-[#555]">
          Solo lectura · No guardamos tus datos · Gratis
        </p>
      </main>

      {/* Preview cards */}
      <section className="pb-20 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-4">
          <PreviewCard
            label="Top artistas"
            value="Frank Ocean"
            sub="412 reproducciones"
            accent="#1DB954"
          />
          <PreviewCard
            label="Género dominante"
            value="R&B"
            sub="34% de tus escuchas"
            accent="#a78bfa"
          />
          <PreviewCard
            label="Índice Mainstream"
            value="34/100"
            sub="Underground"
            accent="#f97316"
          />
        </div>
      </section>
    </div>
  );
}

function PreviewCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-1">
      <span className="text-[#555] text-xs uppercase tracking-wider">{label}</span>
      <span className="text-white font-bold text-lg leading-tight" style={{ color: accent }}>
        {value}
      </span>
      <span className="text-[#666] text-sm">{sub}</span>
    </div>
  );
}

function SpotifyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
    </svg>
  );
}
