import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  getMe,
  getTopArtists,
  getTopTracks,
  getRecentlyPlayed,
  getMainGenres,
  type TimeRange,
} from "@/lib/spotify";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await auth();
  if (!session?.accessToken) redirect("/");

  const params = await searchParams;
  const range = (params.range as TimeRange) || "short_term";

  const [user, artists, tracks, recent] = await Promise.all([
    getMe(session.accessToken),
    getTopArtists(session.accessToken, range, 10),
    getTopTracks(session.accessToken, range, 10),
    getRecentlyPlayed(session.accessToken, 10),
  ]);

  const genres = getMainGenres(artists, 5);

  return (
    <DashboardClient
      user={user}
      artists={artists}
      tracks={tracks}
      recent={recent}
      genres={genres}
      currentRange={range}
    />
  );
}
