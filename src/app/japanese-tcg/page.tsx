import CategoryLanding, {
  categoryMetadata,
} from "@/components/category-landing";

export const metadata = categoryMetadata("Other TCG");

export default function JapaneseTcgPage() {
  return <CategoryLanding category="Other TCG" />;
}
