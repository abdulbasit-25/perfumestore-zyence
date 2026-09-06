import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { StoreShell } from "@/components/storefront/shell";

import { HeroSection } from "@/components/storefront/home/hero-section";
import { ContactSection } from "@/components/storefront/home/contact-section";
import { MarqueeTicker } from "@/components/storefront/home/marquee-ticker";
import { CollectionsSection } from "@/components/storefront/home/collections-section";
import { ProcessSection } from "@/components/storefront/home/process-section";
import { FeaturedProductsSection } from "@/components/storefront/home/featured-products-section";
import { EditorialBanner } from "@/components/storefront/home/editorial-banner";
import { TrustBadges } from "@/components/storefront/home/trust-badges";
import { BestSellersSection } from "@/components/storefront/home/best-sellers-section";
import { NewsletterSection } from "@/components/storefront/home/newsletter-section";
import { ReviewsSection } from "@/components/storefront/home/reviews-section";
import { FaqSection } from "@/components/storefront/home/faq-section";
import { InstagramFeedSection } from "@/components/storefront/home/instagram-feed-section";

import { faqEntries, instagramPosts } from "@/lib/mock-data";
import { getCategories } from "@/lib/category-server";
import { getProducts } from "@/lib/product-server";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title: "Sorrel — Linen, stoneware and objects",
      },
      {
        name: "description",
        content:
          "An independent atelier of linen apparel, hand-thrown ceramics and considered objects. Pay on delivery, ships worldwide.",
      },
      {
        property: "og:title",
        content: "Sorrel — Linen, stoneware and objects",
      },
      {
        property: "og:description",
        content: "Slow-made goods from an independent atelier. Pay on delivery.",
      },
    ],
  }),

  component: Home,
});

function Home() {
  const {
    data: products = [],
    isPending,
    isError,
  } = useQuery({
    queryKey: ["home-products"],
    enabled: typeof window !== "undefined",

    queryFn: async () => {
      try {
        return await getProducts({ data: {} });
      } catch (error) {
        console.error("Unable to load homepage products:", error);
        return [];
      }
    },
  });

  const {
    data: categories = [],
    isPending: categoriesPending,
    isError: categoriesError,
  } = useQuery({
    queryKey: ["home-categories"],
    enabled: typeof window !== "undefined",

    queryFn: async () => {
      try {
        return await getCategories();
      } catch (error) {
        console.error("Unable to load homepage categories:", error);
        return [];
      }
    },
  });

  const featured = products.slice(0, 4);

  const bestSellers = [...products].sort((a, b) => b.rating - a.rating).slice(0, 4);

  return (
    <StoreShell>
      {/* Hero */}
      <HeroSection />

      {/* Marquee */}
      <MarqueeTicker />

      {/* Collections */}
      {categoriesPending ? null : categoriesError ? null : (
        <CollectionsSection categories={categories} />
      )}

      {/* Process */}
      <ProcessSection />

      {/* Featured Products */}
      {isPending ? null : isError ? (
        <p role="alert">Unable to load products.</p>
      ) : (
        <FeaturedProductsSection products={featured} />
      )}

      {/* Trust */}
      <TrustBadges />

      {/* Best Sellers */}
      <BestSellersSection products={bestSellers} />

      {/* Reviews */}
      <ReviewsSection />

      {/* Editorial */}
      <EditorialBanner />

      {/* Newsletter */}
      <NewsletterSection />

      {/* FAQ */}
      <FaqSection items={faqEntries} />

      {/* Instagram */}
      <InstagramFeedSection posts={instagramPosts} />

      {/* Contact */}
      <ContactSection />
    </StoreShell>
  );
}
