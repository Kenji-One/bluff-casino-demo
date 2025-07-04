"use client";

import React from "react";
import Image from "next/image";
import { Game } from "../../services/api";

interface GameCardProps {
  game: Game;
  onPlay: (game: Game) => Promise<void>;
}

const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  return (
    <div
      className="relative overflow-hidden rounded-xl group transition transform hover:-translate-y-1"
      onClick={() => onPlay(game)}
    >
      {/* Image */}
      <Image
        src={game.img || "/images/placeholder.png"}
        alt={game.name}
        width={300}
        height={256}
        className="h-64 w-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = "/images/placeholder.png";
        }}
      />

      {/* Maintenance Overlay */}
      {game.status === "INACTIVE" && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <span className="text-white font-bold">MAINTENANCE</span>
        </div>
      )}
    </div>
  );
};

export default GameCard;
