import { Sparkles, Pipette, FlaskConical, Ship } from "lucide-react";

const process = [
  {
    icon: Sparkles,
    step: "01",
    title: "Compose",
    body: "Perfumers select raw materials and essential oils for a clear scent profile.",
  },
  {
    icon: Pipette,
    step: "02",
    title: "Blend",
    body: "Measured oils are blended and macerated in small batches for depth and balance.",
  },
  {
    icon: FlaskConical,
    step: "03",
    title: "Bottle",
    body: "Each composition is decanted into dark glass, inspected, and prepared with care.",
  },
  {
    icon: Ship,
    step: "04",
    title: "Ship COD",
    body: "Out the door to you — you pay the courier on arrival.",
  },
];

export function ProcessSection() {
  return (
    <section className="rule-top mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
      <p className="label-caps text-olive">How it's made</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {process.map(({ icon: Icon, step, title, body }) => (
          <div
            key={step}
            className="group relative rounded-sm border border-border/60 bg-surface p-6 theme-card-hover md:p-7"
          >
            <div className="flex items-center justify-between">
              <span className="font-display text-sm text-muted-foreground">{step}</span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-olive/30 text-olive transition-colors duration-300 group-hover:bg-olive group-hover:text-surface">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <p className="font-display mt-6 text-xl">{title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
