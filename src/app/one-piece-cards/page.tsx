import CategoryLanding, {
  categoryMetadata,
} from "@/components/category-landing";

export const metadata = categoryMetadata("One Piece");

export default function OnePieceCardsPage() {
  return <CategoryLanding category="One Piece" />;
}
