import type { Metadata } from "next";
import CategoryLanding, {
  categoryMetadata,
} from "@/components/category-landing";
import { getPublishedCatalog, getPublishedContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

const CATEGORY = "Pokemon";

export async function generateMetadata(): Promise<Metadata> {
  const content = await getPublishedContent();
  return categoryMetadata(
    CATEGORY,
    content.categoryPages[CATEGORY],
    content.settings.siteName,
  );
}

export default async function PokemonCardsPage() {
  const [content, catalog] = await Promise.all([
    getPublishedContent(),
    getPublishedCatalog(),
  ]);
  return (
    <CategoryLanding
      category={CATEGORY}
      config={content.categoryPages[CATEGORY]}
      allConfigs={content.categoryPages}
      products={catalog.filter((p) => p.category === CATEGORY)}
      totalCount={catalog.length}
      siteName={content.settings.siteName}
      freeShippingThreshold={content.settings.freeShippingThreshold}
    />
  );
}
