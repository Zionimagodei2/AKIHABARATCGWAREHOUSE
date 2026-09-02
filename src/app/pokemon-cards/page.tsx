import CategoryLanding, {
  categoryMetadata,
} from "@/components/category-landing";

export const metadata = categoryMetadata("Pokemon");

export default function PokemonCardsPage() {
  return <CategoryLanding category="Pokemon" />;
}
