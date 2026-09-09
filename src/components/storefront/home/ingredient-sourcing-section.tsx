import { motion } from "framer-motion";
import { useRef } from "react";

interface Ingredient {
  name: string;
  origin: string;
  extraction: string;
  description: string;
  image: string;
}

const INGREDIENTS: Ingredient[] = [
  {
    name: "Bergamot",
    origin: "Calabria, Italy",
    extraction: "Cold-pressed citrus peel",
    description:
      "Bright, citric top note sourced from family groves in Southern Italy, hand-harvested and pressed within hours.",
    image:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23F4A460'/%3E%3Ccircle cx='50' cy='50' r='35' fill='%23FFA500'/%3E%3C/svg%3E",
  },
  {
    name: "Oud",
    origin: "Assam, India",
    extraction: "Wood distillation",
    description:
      "Deep base note from aged agarwood trees. Rich, woody character that forms the heart of our signature scents.",
    image:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%238B4513'/%3E%3Crect x='10' y='10' width='30' height='70' fill='%23654321'/%3E%3Crect x='60' y='15' width='25' height='65' fill='%23654321'/%3E%3C/svg%3E",
  },
  {
    name: "Ambergris Alternative",
    origin: "Lab-synthesized",
    extraction: "Bio-identical molecule",
    description:
      "Sustainable replacement for natural ambergris. Warm, animalic base note without harvesting risk.",
    image:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23D4A574'/%3E%3Ccircle cx='35' cy='35' r='8' fill='%23C9956D'/%3E%3Ccircle cx='65' cy='70' r='6' fill='%23C9956D'/%3E%3C/svg%3E",
  },
  {
    name: "Rose Absolute",
    origin: "Grasse, France",
    extraction: "Solvent extraction",
    description:
      "Floral heart from Damascus rose petals. Each batch carries the terroir of the Provence region.",
    image:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%23E75480'/%3E%3Ccircle cx='50' cy='50' r='30' fill='%23D4456B'/%3E%3Ccircle cx='50' cy='50' r='18' fill='%23C93456'/%3E%3C/svg%3E",
  },
  {
    name: "Vetiver",
    origin: "Madagascar",
    extraction: "Steam distillation",
    description:
      "Earthy, grassy base note from vetiver root. Provides stability and longevity to our compositions.",
    image:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%235C7A52'/%3E%3Cline x1='20' y1='30' x2='20' y2='80' stroke='%23456B3F' stroke-width='3'/%3E%3Cline x1='50' y1='20' x2='50' y2='85' stroke='%23456B3F' stroke-width='3'/%3E%3Cline x1='80' y1='35' x2='80' y2='80' stroke='%23456B3F' stroke-width='3'/%3E%3C/svg%3E",
  },
  {
    name: "Musk",
    origin: "Synthetic only",
    extraction: "Lab creation",
    description:
      "Warm, skin-like base note. We use only synthesized molecules—never animal-derived ingredients.",
    image:
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='%238B7765'/%3E%3Cpath d='M 50 15 Q 70 35 70 50 Q 70 70 50 75 Q 30 70 30 50 Q 30 35 50 15' fill='%23A0957A'/%3E%3C/svg%3E",
  },
];

/**
 * IngredientSourcingSection - Transparency-focused section
 * Shows raw material sourcing and extraction methods
 */
export function IngredientSourcingSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
      {/* Header */}
      <motion.div
        className="mb-12 md:mb-16"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <p className="label-caps mb-4 flex items-center gap-3 text-muted-foreground font-mono text-xs tracking-wider">
          <span aria-hidden className="h-px w-10 bg-amber-700" />
          Ingredient Transparency
        </p>
        <h2 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl text-foreground mb-4">
          Sourced & Tested
        </h2>
        <p className="max-w-2xl text-base text-muted-foreground">
          Each ingredient is carefully selected, traced to its origin, and tested for purity and
          performance. We list everything we use—no mystery molecules, no undisclosed synthetics.
        </p>
      </motion.div>

      {/* Horizontal scroll grid */}
      <motion.div
        ref={scrollContainerRef}
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        {INGREDIENTS.map((ingredient, index) => (
          <motion.div
            key={ingredient.name}
            variants={itemVariants}
            className="group overflow-hidden rounded-sm border border-border/50 bg-surface transition-all duration-300 hover:border-amber-700/30 hover:shadow-lg"
          >
            {/* Ingredient image placeholder */}
            <div className="aspect-square bg-gradient-to-br from-stone-100 to-stone-50 overflow-hidden relative">
              <img
                src={ingredient.image}
                alt={ingredient.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>

            {/* Ingredient details */}
            <div className="p-6 space-y-3">
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {ingredient.name}
                </h3>
                <p className="text-xs font-mono text-amber-700 tracking-wider mt-1">
                  {ingredient.origin.toUpperCase()}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  Extraction: {ingredient.extraction}
                </p>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {ingredient.description}
              </p>

              {/* Visual accent line */}
              <div className="pt-3 border-t border-border/50">
                <div className="h-0.5 bg-gradient-to-r from-amber-700/60 to-transparent w-full" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer note */}
      <motion.div
        className="mt-12 p-6 bg-surface-2 rounded-sm border border-border/50"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Our commitment:</span> All ingredients are
          certified for purity, tested for skin compatibility, and sourced through ethical supply
          chains. We maintain full batch traceability from origin through final formulation.
        </p>
      </motion.div>
    </section>
  );
}
