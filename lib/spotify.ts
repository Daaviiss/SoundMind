export type TimeRange = "short_term" | "medium_term" | "long_term";

export interface SpotifyArtist {
  id: string;
  name: string;
  images: { url: string; width: number; height: number }[];
  genres: string[];
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: {
    id: string;
    name: string;
    images: { url: string; width: number; height: number }[];
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  images: { url: string }[];
  email: string;
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

async function spotifyFetch(url: string, accessToken: string) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    throw new Error(`Spotify API error: ${res.status} ${url}`);
  }
  return res.json();
}

export async function getMe(accessToken: string): Promise<SpotifyUser> {
  return spotifyFetch("https://api.spotify.com/v1/me", accessToken);
}

export async function getTopArtists(
  accessToken: string,
  timeRange: TimeRange = "short_term",
  limit = 6
): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch(
    `https://api.spotify.com/v1/me/top/artists?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );
  return data.items;
}

export async function getTopTracks(
  accessToken: string,
  timeRange: TimeRange = "short_term",
  limit = 10
): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch(
    `https://api.spotify.com/v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`,
    accessToken
  );
  return data.items;
}

export async function getRecentlyPlayed(
  accessToken: string,
  limit = 10
): Promise<RecentlyPlayedItem[]> {
  const data = await spotifyFetch(
    `https://api.spotify.com/v1/me/player/recently-played?limit=${limit}`,
    accessToken
  );
  return data.items;
}

export function extractGenres(artists: SpotifyArtist[]): { genre: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const artist of artists) {
    for (const genre of artist.genres) {
      counts[genre] = (counts[genre] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count);
}

export function getMainGenres(artists: SpotifyArtist[], topN = 5) {
  const genres = extractGenres(artists);
  return genres.slice(0, topN);
}

// Estimate the dominant decade from track names / artist context —
// since we can't use audio-features or popularity, we use the track's album release year from the album name heuristic.
// Real epoch comes from album data when available — we'll handle this at the component level.

export function timeRangeLabel(range: TimeRange): string {
  switch (range) {
    case "short_term": return "Semanal";
    case "medium_term": return "Últimos 3 meses";
    case "long_term": return "Último año";
  }
}
