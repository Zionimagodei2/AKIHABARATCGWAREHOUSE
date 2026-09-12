import CategoryLanding, {
  categoryMetadata,
} from "@/components/category-landing";

export const metadata = categoryMetadata("Japanese One Piece");

export default function OnePieceCardsPage() {
  return <CategoryLanding category="Japanese One Piece" />;
}
