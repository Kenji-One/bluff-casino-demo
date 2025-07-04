import MainLayout from "@/components/layout/MainLayout";
import GamesGrid from "@/components/games/GamesGrid";
import ListHeader from "@/components/ListHeader";
export default function SlotsPage() {
  return (
    <MainLayout>
      <ListHeader title="Slots" />
      <GamesGrid />
    </MainLayout>
  );
}
