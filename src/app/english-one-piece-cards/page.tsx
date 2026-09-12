import CategoryLanding, {
  categoryMetadata,
} from "@/components/category-landing";

export const metadata = categoryMetadata("English One Piece");

export default function EnglishOnePieceCardsPage() {
  return <CategoryLanding category="English One Piece" />;
}
