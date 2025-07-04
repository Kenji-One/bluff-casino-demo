// src/hooks/useGames.ts
// "use client";
// import { useEffect, useState } from "react";
// import { fetchGames, Game } from "@/lib/games";

// export function useGames(productId = "JOKER") {
//   const [games, setGames] = useState<Game[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     setLoading(true);
//     fetchGames(productId)
//       .then(setGames)
//       .catch((e) => setError(e.message))
//       .finally(() => setLoading(false));
//   }, [productId]);

//   return { games, loading, error };
// }
"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient, Game } from "@/services/api";

export function useGames(filters: Parameters<typeof apiClient.listGames>[0]) {
  return useQuery<Game[]>({
    queryKey: ["games", filters],
    queryFn: () => apiClient.listGames(filters),
  });
}
