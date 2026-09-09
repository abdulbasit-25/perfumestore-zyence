import { Sparkles, Pipette, FlaskConical, Ship } from "lucide-react";
import { motion } from "framer-motion";

const process = [
  {
    icon: Sparkles,
    step: "01",
    title: "Compose",
    body: "Perfumers select and weigh raw materials with precision scales to achieve exact concentrations.",
  },
  {
    icon: Pipette,
    step: "02",
    title: "Blend",
    body: "Measured oils are macerated in small batches for 72 hours to develop depth and complexity.",
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "Test",
    body: "Each batch is tested on skin before approval. Quality control—no exceptions.",
  },
  {
    icon: Ship,
    step: "04",
    title: "Ship",
    body: "Inspected and sealed. Delivered to you—pay the courier on arrival.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
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

export function ProcessSection() {
  return (
    <section className="rule-top mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
      {/* Section header */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <p className="label-caps text-amber-700 font-mono text-xs tracking-wider">Manufacturing Process</p>
        <h2 className="font-serif text-4xl leading-[1.05] tracking-tight md:text-6xl text-foreground mt-2">
          How it&apos;s Made
        </h2>
      </motion.div>

      {/* Process steps with connecting line */}
      <div className="relative">
        {/* Animated connecting line - desktop only */}
        <motion.div
          className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-700/50 via-amber-700/30 to-transparent"
          initial={{ scaleX: 0, originX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          viewport={{ once: true, margin: "-100px" }}
        />

        <motion.div
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {process.map(({ icon: Icon, step, title, body }) => (
            <motion.div
              key={step}
              variants={itemVariants}
              className="group relative rounded-sm border border-border/50 bg-surface p-6 md:p-8 transition-all duration-300 hover:border-amber-700/30 hover:shadow-lg hover:bg-surface-2"
            >
              {/* Step number and icon header */}
              <div className="flex items-start justify-between mb-6">
                <span className="font-mono text-2xl font-semibold text-amber-700 tracking-wider">{step}</span>
                <motion.div
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-700/20 text-amber-700 transition-colors duration-300 group-hover:bg-amber-700/10"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
              </div>

              {/* Content */}
              <div>
                <h3 className="font-serif text-xl font-semibold text-foreground">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </div>

              {/* Accent line */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-700/0 via-amber-700/20 to-amber-700/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Timeline note for mobile */}
      <motion.p
        className="mt-8 text-xs text-muted-foreground font-mono text-center lg:hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        Compose → Blend → Test → Ship
      </motion.p>
    </section>
  );
}
