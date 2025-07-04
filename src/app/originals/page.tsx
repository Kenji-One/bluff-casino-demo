import MainLayout from "@/components/layout/MainLayout";
import ListHeader from "@/components/ListHeader";
import GamesGrid from "@/components/games/GamesGrid";

export default function OriginalsPage() {
  return (
    <MainLayout>
      <ListHeader title="Originals" />
      <GamesGrid />
    </MainLayout>
  );
}
