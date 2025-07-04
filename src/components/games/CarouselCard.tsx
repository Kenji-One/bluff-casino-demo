"use client";

import Image from "next/image";
import { Game } from "@/services/api";

interface Props {
  game: Game;
  onClick?: (g: Game) => void;
}

export default function CarouselCard({ game, onClick }: Props) {
  const img = game.img || "/images/slot-placeholder.png";
  // console.log("CarouselCard", game);
  return (
    <button
      className="relative w-full h-full overflow-hidden rounded-xl group cursor-pointer"
      onClick={() => onClick?.(game)}
    >
      <Image
        src={img}
        alt={game.name}
        fill
        sizes="150px"
        unoptimized
        className="transition-transform duration-300 group-hover:scale-105 cursor-pointer"
      />
      {/* <div className="absolute bottom-0 w-full bg-black/60 py-1 text-center text-xs text-white">
        {game.name.length > 18 ? game.name.slice(0, 16) + "…" : game.name}
      </div> */}
    </button>
  );
}
