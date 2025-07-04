import { Menu, Search, Headphones, Gamepad2, Crown } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-gray-800 text-white flex justify-around py-2 border-t border-gray-700">
      <div className="flex flex-col items-center text-xs">
        <Menu className="h-5 w-5" />
        Menu
      </div>
      <div className="flex flex-col items-center text-xs">
        <Search className="h-5 w-5" />
        Search
      </div>
      <div className="flex flex-col items-center text-xs">
        <Headphones className="h-5 w-5" />
        Chat
      </div>
      <div className="flex flex-col items-center text-xs">
        <Gamepad2 className="h-5 w-5" />
        Originals
      </div>
      <div className="flex flex-col items-center text-xs">
        <Crown className="h-5 w-5" />
        VIP
      </div>
    </nav>
  );
}
