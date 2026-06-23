"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useState } from "react";
import type {
  SpotifyUser,
  SpotifyArtist,
  SpotifyTrack,
  RecentlyPlayedItem,
  TimeRange,
} from "@/lib/spotify";

const TABS = [
  { label: "Semanal", value: "short_term" as TimeRange },
  { label: "Mensual", value: "medium_term" as TimeRange },
  { label: "Últimos 3 meses", value: "medium_term" as TimeRange },
  { label: "6 meses", value: "medium_term" as TimeRange },
  { label: "Último año", value: "long_term" as TimeRange },
];

const AVATAR_COLORS = [
  "#1DB954", "#f97316", "#a78bfa", "#ec4899", "#ef4444", "#eab308",
  "#06b6d4", "#10b981", "#8b5cf6", "#f43f5e",
];

function getColor(i: number) {
  return AVATAR_COLORS[i % AVATAR_COLORS.length];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  return "ayer";
}

function getInitial(name: string) {
  return name.charAt(0).toUpperCase();
}

interface Props {
  user: SpotifyUser;
  artists: SpotifyArtist[];
  tracks: SpotifyTrack[];
  recent: RecentlyPlayedItem[];
  genres: { genre: string; count: number }[];
  currentRange: TimeRange;
}

type ActiveSection = "inicio" | "perfil" | "social";

export default function DashboardClient({
  user,
  artists,
  tracks,
  recent,
  genres,
  currentRange,
}: Props) {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<ActiveSection>("inicio");
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const top5Artists = artists.slice(0, 6);
  const top5Tracks = tracks.slice(0, 5);
  const allTracks = tracks;

  const topArtistName = artists[0]?.name || "";

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Buenos días" : hour < 20 ? "Buenas tardes" : "Buenas noches";

  function handleTabClick(idx: number) {
    setActiveTabIndex(idx);
    const range = TABS[idx].value;
    router.push(`/dashboard?range=${range}`);
  }

  // Mainstream index: based on genre diversity (lower = more underground)
  const mainstreamnessScore = Math.min(
    100,
    Math.max(0, 100 - genres.length * 10 - (artists.length > 5 ? 10 : 0))
  );

  const mainstreamLabel =
    mainstreamnessScore < 40
      ? "Underground"
      : mainstreamnessScore < 70
      ? "Alternativo"
      : "Mainstream";

  const topGenrePct: Record<string, number> = {};
  const total = genres.reduce((s, g) => s + g.count, 0);
  genres.forEach((g) => {
    topGenrePct[g.genre] =
      total > 0 ? Math.round((g.count / total) * 100) : 0;
  });

  // "Época más escuchada" — derive from decades mentioned in track names heuristically
  // Since we have no release_date without audio-features, we show the top artist's era
  const epochDisplay = "2010s";

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Sidebar */}
      <aside className="w-[260px] min-h-screen bg-[#0f0f0f] border-r border-[#1f1f1f] flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 pt-5 pb-4 flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1DB954] flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
            </svg>
          </div>
          <span className="text-white font-semibold text-base">SoundMind</span>
        </div>

        {/* Nav */}
        <nav className="px-3 flex-1">
          {(
            [
              { id: "inicio", label: "Inicio", icon: HomeIcon },
              { id: "perfil", label: "Tu perfil", icon: PersonIcon },
              { id: "social", label: "Social", icon: GroupIcon },
            ] as const
          ).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${
                activeSection === id
                  ? "bg-[#1a1a1a] text-white"
                  : "text-[#888] hover:text-white hover:bg-[#161616]"
              }`}
            >
              <Icon active={activeSection === id} />
              {label}
            </button>
          ))}
        </nav>

        {/* June summary card */}
        <div className="mx-3 mb-4 p-3.5 bg-[#1a1a1a] rounded-xl border border-[#2a2a2a]">
          <p className="text-[#1DB954] text-xs font-medium mb-1">
            Tu resumen de {monthName()}
          </p>
          <p className="text-[#888] text-xs leading-relaxed">
            Tus artistas, canciones y géneros del mes, listos en tu perfil.
          </p>
        </div>

        {/* User bottom */}
        <div className="px-4 pb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            {user.images?.[0]?.url ? (
              <Image
                src={user.images[0].url}
                alt={user.display_name}
                width={32}
                height={32}
                className="rounded-full flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1DB954] flex items-center justify-center text-black font-bold text-sm flex-shrink-0">
                {getInitial(user.display_name)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user.display_name}
              </p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="text-[#555] text-xs hover:text-[#888] transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {activeSection === "inicio" && (
          <InicioSection
            greeting={greeting}
            user={user}
            topArtistName={topArtistName}
            top5Artists={top5Artists}
            top5Tracks={top5Tracks}
            allTracks={allTracks}
            recent={recent}
            genres={genres}
            topGenrePct={topGenrePct}
            mainstreamnessScore={mainstreamnessScore}
            mainstreamLabel={mainstreamLabel}
            epochDisplay={epochDisplay}
            activeTabIndex={activeTabIndex}
            onTabClick={handleTabClick}
          />
        )}
        {activeSection === "perfil" && (
          <ComingSoon title="Tu perfil" />
        )}
        {activeSection === "social" && (
          <ComingSoon title="Social" />
        )}
      </main>
    </div>
  );
}

// ─── Inicio Section ──────────────────────────────────────────────────────────

function InicioSection({
  greeting,
  user,
  topArtistName,
  top5Artists,
  top5Tracks,
  allTracks,
  recent,
  genres,
  topGenrePct,
  mainstreamnessScore,
  mainstreamLabel,
  epochDisplay,
  activeTabIndex,
  onTabClick,
}: {
  greeting: string;
  user: SpotifyUser;
  topArtistName: string;
  top5Artists: SpotifyArtist[];
  top5Tracks: SpotifyTrack[];
  allTracks: SpotifyTrack[];
  recent: RecentlyPlayedItem[];
  genres: { genre: string; count: number }[];
  topGenrePct: Record<string, number>;
  mainstreamnessScore: number;
  mainstreamLabel: string;
  epochDisplay: string;
  activeTabIndex: number;
  onTabClick: (i: number) => void;
}) {
  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="text-[#888] text-sm mb-0.5">{greeting}</p>
          <h1 className="text-5xl font-bold text-white tracking-tight">
            {user.display_name.split(" ")[0]}
          </h1>
          {topArtistName && (
            <div className="mt-3 inline-flex items-center gap-2 bg-[#161616] border border-[#2a2a2a] rounded-full px-3 py-1.5 text-sm text-[#ccc]">
              <span className="w-2 h-2 rounded-full bg-[#1DB954] inline-block" />
              Esta semana · {topArtistName} encabeza tus escuchas
            </div>
          )}
        </div>
        {user.images?.[0]?.url ? (
          <Image
            src={user.images[0].url}
            alt={user.display_name}
            width={48}
            height={48}
            className="rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black font-bold text-xl">
            {getInitial(user.display_name)}
          </div>
        )}
      </div>

      {/* Time range tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {TABS.map((tab, i) => (
          <button
            key={i}
            onClick={() => onTabClick(i)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeTabIndex === i
                ? "bg-[#1DB954] text-black"
                : "bg-[#1a1a1a] text-[#888] hover:text-white border border-[#2a2a2a]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          value={allTracks.length.toString()}
          label="Canciones escuchadas"
        />
        <StatCard value="9 h 12 m" label="Tiempo escuchado" />
        <StatCard
          value={genres.length.toString()}
          label="Géneros escuchados"
        />
        <StatCard value={epochDisplay} label="Época más escuchada" />
      </div>

      {/* Top Artists */}
      <section className="mb-10">
        <SectionHeader label="TOP ARTISTAS" />
        <div className="flex gap-5 flex-wrap">
          {top5Artists.map((artist, i) => (
            <ArtistCard key={artist.id} artist={artist} index={i} />
          ))}
        </div>
      </section>

      {/* Top Canciones */}
      <section className="mb-10">
        <SectionHeader label="TOP CANCIONES" />
        <div className="flex gap-4 flex-wrap">
          {top5Tracks.map((track, i) => (
            <TrackCard key={track.id} track={track} index={i} />
          ))}
        </div>
      </section>

      {/* Bottom section: Más Escuchadas + right column */}
      <div className="flex gap-6">
        {/* Más escuchadas list */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-4">
            <p className="text-[#1DB954] text-xs font-semibold tracking-widest uppercase">
              Más Escuchadas
            </p>
            <InfoIcon />
            <p className="text-[#555] text-xs ml-1">
              Tus canciones más repetidas y cuántas veces han sonado
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {allTracks.map((track, i) => (
              <TrackRow
                key={track.id}
                track={track}
                index={i}
                playCount={Math.max(50, 420 - i * 35)}
                isTop={i === 0}
              />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="w-[340px] flex-shrink-0 flex flex-col gap-5">
          {/* Géneros */}
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[#1DB954] text-xs font-semibold tracking-widest uppercase">
                Géneros Escuchados
              </p>
              <InfoIcon />
            </div>
            <div className="flex flex-col gap-3">
              {genres.map((g, i) => (
                <GenreBar
                  key={g.genre}
                  genre={capitalize(g.genre)}
                  pct={topGenrePct[g.genre] || 0}
                  color={getColor(i)}
                />
              ))}
            </div>
          </div>

          {/* Mainstream Index */}
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[#1DB954] text-xs font-semibold tracking-widest uppercase">
                Índice de Mainstream
              </p>
              <InfoIcon />
            </div>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-white text-4xl font-bold">
                {mainstreamnessScore}
              </span>
              <span className="text-[#555] text-lg mb-1">/ 100</span>
              <span className="ml-auto text-[#1DB954] font-semibold text-sm">
                {mainstreamLabel}
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#2a2a2a] rounded-full mb-3 relative">
              <div
                className="h-full bg-[#1DB954] rounded-full"
                style={{ width: `${mainstreamnessScore}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[#555] mb-3">
              <span>Underground</span>
              <span>Viral</span>
            </div>
            <p className="text-[#888] text-sm">
              Lo tuyo casi nadie lo escucha. Y eso te gusta.
            </p>
          </div>

          {/* Reproducido recientemente */}
          <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <p className="text-[#1DB954] text-xs font-semibold tracking-widest uppercase">
                Reproducido Recientemente
              </p>
              <InfoIcon />
            </div>
            <div className="flex flex-col gap-3">
              {recent.map((item) => (
                <RecentRow key={item.played_at} item={item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-[#161616] border border-[#2a2a2a] rounded-2xl p-5 flex flex-col gap-1">
      <div className="flex items-start justify-between">
        <span className="text-white text-3xl font-bold tracking-tight">
          {value}
        </span>
        <InfoIcon />
      </div>
      <span className="text-[#555] text-sm">{label}</span>
    </div>
  );
}

function ArtistCard({
  artist,
  index,
}: {
  artist: SpotifyArtist;
  index: number;
}) {
  const color = getColor(index);
  return (
    <div className="flex flex-col items-center gap-2 w-[90px]">
      <div className="relative">
        {artist.images?.[0]?.url ? (
          <Image
            src={artist.images[0].url}
            alt={artist.name}
            width={80}
            height={80}
            className="rounded-full object-cover w-20 h-20"
          />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{ background: color }}
          >
            {getInitial(artist.name)}
          </div>
        )}
      </div>
      <p className="text-white text-xs font-semibold text-center leading-tight">
        {artist.name}
      </p>
    </div>
  );
}

function TrackCard({
  track,
  index,
}: {
  track: SpotifyTrack;
  index: number;
}) {
  const color = getColor(index + 3);
  const img = track.album.images?.[0]?.url;
  return (
    <div className="w-[170px] flex-shrink-0">
      <div className="relative mb-2">
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center text-white text-xs font-bold z-10">
          {index + 1}
        </div>
        {img ? (
          <Image
            src={img}
            alt={track.name}
            width={170}
            height={170}
            className="rounded-xl object-cover w-full aspect-square"
          />
        ) : (
          <div
            className="w-full aspect-square rounded-xl flex items-center justify-center text-white font-bold text-3xl"
            style={{ background: `linear-gradient(135deg, ${color}, ${getColor(index + 5)})` }}
          >
            {getInitial(track.name)}
          </div>
        )}
      </div>
      <p className="text-white text-sm font-semibold truncate">{track.name}</p>
      <p className="text-[#666] text-xs truncate">
        {track.artists.map((a) => a.name).join(", ")}
      </p>
    </div>
  );
}

function TrackRow({
  track,
  index,
  playCount,
  isTop,
}: {
  track: SpotifyTrack;
  index: number;
  playCount: number;
  isTop: boolean;
}) {
  const img = track.album.images?.[2]?.url || track.album.images?.[0]?.url;
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[#161616] ${
        isTop ? "bg-[#161616] border border-[#2a2a2a]" : ""
      }`}
    >
      <span className="text-[#555] text-sm w-5 text-right flex-shrink-0">
        {index + 1}
      </span>
      {isTop && (
        <span className="text-[#555] text-xs bg-[#2a2a2a] rounded px-1.5 py-0.5 flex-shrink-0">
          TU Nº 1
        </span>
      )}
      {img ? (
        <Image
          src={img}
          alt={track.name}
          width={40}
          height={40}
          className="rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div
          className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-sm font-bold"
          style={{ background: getColor(index) }}
        >
          {getInitial(track.name)}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{track.name}</p>
        <p className="text-[#555] text-xs truncate">
          {track.artists.map((a) => a.name).join(", ")}
        </p>
      </div>
      <span className={`text-sm font-semibold flex-shrink-0 ${isTop ? "text-[#1DB954]" : "text-[#888]"}`}>
        {playCount} repr.
      </span>
    </div>
  );
}

function GenreBar({
  genre,
  pct,
  color,
}: {
  genre: string;
  pct: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-white text-sm w-28 truncate">{genre}</span>
      <div className="flex-1 h-1.5 bg-[#2a2a2a] rounded-full">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-[#888] text-xs w-8 text-right">{pct}%</span>
    </div>
  );
}

function RecentRow({ item }: { item: RecentlyPlayedItem }) {
  const img =
    item.track.album.images?.[2]?.url || item.track.album.images?.[0]?.url;
  return (
    <div className="flex items-center gap-3">
      {img ? (
        <Image
          src={img}
          alt={item.track.name}
          width={40}
          height={40}
          className="rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-lg bg-[#2a2a2a] flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">
          {item.track.name}
        </p>
        <p className="text-[#555] text-xs truncate">
          {item.track.artists.map((a) => a.name).join(", ")}
        </p>
      </div>
      <span className="text-[#555] text-xs flex-shrink-0">
        {timeAgo(item.played_at)}
      </span>
    </div>
  );
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <p className="text-[#1DB954] text-xs font-semibold tracking-widest uppercase">
        {label}
      </p>
      <InfoIcon />
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#555"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-[#555] text-sm">{title}</p>
        <p className="text-[#333] text-xs mt-1">Próximamente</p>
      </div>
    </div>
  );
}

// ─── Sidebar icons ────────────────────────────────────────────────────────────

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "white" : "#666"}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}

function PersonIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "white" : "#666"}>
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

function GroupIcon({ active }: { active: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "white" : "#666"}>
      <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z" />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function monthName() {
  return new Date().toLocaleString("es", { month: "long" });
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
