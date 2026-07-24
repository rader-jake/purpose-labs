import { getBestSellers } from "@/lib/woocommerce";
import { HomeHero } from "@/components/home/HomeHero";
import { TrustStats } from "@/components/home/TrustStats";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { QualityProof } from "@/components/home/QualityProof";
import { EditorialStory } from "@/components/home/EditorialStory";
import { CategoryDiscovery } from "@/components/home/CategoryDiscovery";
import { ResearchAccessCTA } from "@/components/home/ResearchAccessCTA";

export default async function HomePage() {
  // Fetch best seller products from WooCommerce server-side
  const products = await getBestSellers(4);

  return (
    <main className="flex-1 bg-[#F1F6F9]">
      <HomeHero />
      <TrustStats />
      <FeaturedProducts products={products} />
      <QualityProof />
      <EditorialStory />
      <CategoryDiscovery />
      <ResearchAccessCTA />
    </main>
  );
}
