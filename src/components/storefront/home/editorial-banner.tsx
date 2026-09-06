import { Banknote, Eye, ShieldCheck } from "lucide-react";

const trustPoints = [
  {
    icon: Eye,
    title: "Inspect first",
    text: "Open the parcel and check every piece before money changes hands.",
  },
  {
    icon: ShieldCheck,
    title: "Nothing upfront",
    text: "No card details, no deposits, no checkout forms to fight with.",
  },
  {
    icon: Banknote,
    title: "Courier collects",
    text: "Payment goes straight to the courier the moment you're satisfied.",
  },
];

function CornerMark({ className }: { className?: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute h-3.5 w-3.5 ${className}`}>
      <span className="absolute left-1/2 top-0 h-full w-px bg-olive/30" />
      <span className="absolute left-0 top-1/2 h-px w-full bg-olive/30" />
    </span>
  );
}

export function EditorialBanner() {
  return (
    <section className="mx-auto mt-20 max-w-[1500px] px-5 md:mt-24 md:px-10">
      <div className="relative overflow-hidden rounded-sm bg-olive-soft px-6 py-16 text-center md:px-20 md:py-24">
        {/* Print-style registration marks */}
        <CornerMark className="left-4 top-4 md:left-5 md:top-5" />
        <CornerMark className="right-4 top-4 md:right-5 md:top-5" />
        <CornerMark className="bottom-4 left-4 md:bottom-5 md:left-5" />
        <CornerMark className="bottom-4 right-4 md:bottom-5 md:right-5" />

        {/* Rotating stamp */}
        <div className="relative mx-auto mb-8 h-20 w-20 md:mb-10">
          <svg
            viewBox="0 0 100 100"
            className="zyence-stamp h-full w-full text-olive/70 motion-safe:animate-[spin_24s_linear_infinite]"
          >
            <defs>
              <path id="stampCircle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
            </defs>
            <text fontSize="8.2" letterSpacing="2" fill="currentColor">
              <textPath href="#stampCircle">
                CASH ON DELIVERY • PAY ON RECEIPT • CASH ON DELIVERY •
              </textPath>
            </text>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center">
            <Banknote className="h-5 w-5 text-olive" strokeWidth={1.5} />
          </span>
        </div>

        <p className="label-caps relative text-olive">On payment</p>

        <p className="relative mx-auto mt-6 max-w-3xl font-display text-2xl leading-tight sm:text-3xl md:text-5xl md:leading-[1.15]">
          No card, no checkout friction. You pay the courier when the parcel is{" "}
          <em className="italic text-olive">in your hands</em>.
        </p>

        {/* Supporting trust row */}
        <dl className="relative mx-auto mt-12 grid max-w-4xl gap-px overflow-hidden rounded-sm bg-hairline text-left sm:grid-cols-3 md:mt-16">
          {trustPoints.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-olive-soft px-6 py-5">
              <dt className="label-caps flex items-center gap-2 text-olive">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {title}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
