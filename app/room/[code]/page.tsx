import GameBoard from "@/components/GameBoard";

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { code } = await params;
  return <GameBoard code={code.toUpperCase()} />;
}
