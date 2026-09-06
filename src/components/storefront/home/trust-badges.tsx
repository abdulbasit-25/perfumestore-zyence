import { CreditCard, RefreshCcw, Globe2, ShieldCheck } from "lucide-react";

const badges = [
  {
    icon: CreditCard,
    label: "Pay on delivery",
    body: "Cash to the courier, no card required",
  },
  {
    icon: RefreshCcw,
    label: "14-day returns",
    body: "Free returns within two weeks on eligible goods",
  },
  {
    icon: Globe2,
    label: "Ships worldwide",
    body: "Tracked international to 120+ countries",
  },
  {
    icon: ShieldCheck,
    label: "Secure checkout",
    body: "Protected order, verified courier, full support",
  },
];

export function TrustBadges() {
  return (
    <section className="rule-top rule-bottom">
      <div className="mx-auto max-w-[1500px] px-5 py-8 md:px-10 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {badges.map(({ icon: Icon, label, body }, i) => (
            <div
              key={i}
              className="group flex flex-col gap-3 border-l border-border/60 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 first:border-l-0 md:px-6 md:py-4"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-olive/30 text-olive transition-colors duration-300 group-hover:bg-olive group-hover:text-surface">
                <Icon className="h-5 w-5" />
              </div>
              <p className="label-caps text-olive">{label}</p>
              <p className="font-display text-base leading-snug">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
