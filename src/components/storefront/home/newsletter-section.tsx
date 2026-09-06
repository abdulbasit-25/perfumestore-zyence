import { Mail, ArrowRight } from "lucide-react";

export function NewsletterSection() {
  return (
    <section className="rule-top rule-bottom bg-olive-soft/50">
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between md:gap-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3">
              <p className="label-caps text-olive">Newsletter</p>
              <div className="hidden h-10 w-10 items-center justify-center rounded-full border border-olive/30 text-olive sm:flex">
                <Mail className="h-4 w-4" />
              </div>
            </div>
            <h2 className="font-display mt-4 text-3xl leading-tight sm:text-4xl md:text-5xl">
              Join the atelier list
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Early access to drops, atelier notes, and 10% off your first order.
            </p>

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mt-8 flex flex-col gap-3 sm:flex-row md:mt-10"
            >
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 rounded-sm border border-border/60 bg-background px-4 py-4 text-sm focus:border-olive focus:outline-none focus:ring-0 placeholder:text-muted-foreground"
              />
              <button
                type="submit"
                className="label-caps group inline-flex items-center justify-center gap-2 bg-primary px-7 py-4 text-primary-foreground transition-colors hover:bg-olive hover:text-accent-foreground"
              >
                Subscribe
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </form>

            <p className="mt-4 text-xs text-muted-foreground">
              We never share your email. Unsubscribe any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
