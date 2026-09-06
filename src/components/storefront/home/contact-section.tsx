import { Mail, MapPin, Phone } from "lucide-react";
import { ContactForm } from "@/components/storefront/contact-form";

export function ContactSection() {
  return (
    <section className="relative overflow-hidden border-t border-border/60">
      {/* Decorative background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-olive/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 bottom-0 h-80 w-80 rounded-full bg-olive/5 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-[1500px] gap-6 px-5 py-16 md:px-10 md:py-24">
        {/* Spine label — desktop only */}
        <div className="hidden shrink-0 md:flex md:w-10 md:items-start md:justify-center">
          <span className="label-caps origin-top-left translate-y-full -rotate-90 whitespace-nowrap text-olive">
            Contact — Zyence Studio — 2026
          </span>
        </div>

        <div className="grid flex-1 gap-12 md:grid-cols-12 md:gap-16">
          {/* Intro */}
          <div className="rise md:col-span-5 md:pt-8">
            <p className="label-caps flex items-center gap-2 text-olive">
              <span className="h-px w-6 bg-olive" />
              Say hello
            </p>

            <h2 className="display-xl mt-5">
              Let’s make
              <br />
              <em className="italic">something</em> quiet.
            </h2>

            <p className="mt-6 max-w-md text-muted-foreground md:mt-8">
              Questions about an order, a piece from the collection, or something you have in mind?
              We’d love to hear from you.
            </p>

            <div className="mt-8 space-y-5 md:mt-10">
              <a href="mailto:hello@zyence.com" className="group flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition-colors group-hover:border-olive group-hover:bg-olive/5">
                  <Mail className="h-4 w-4 text-olive" />
                </span>

                <span className="text-sm transition-colors group-hover:text-olive">
                  hello@zyence.com
                </span>
              </a>

              <a href="tel:+1234567890" className="group flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition-colors group-hover:border-olive group-hover:bg-olive/5">
                  <Phone className="h-4 w-4 text-olive" />
                </span>

                <span className="text-sm transition-colors group-hover:text-olive">
                  +1 234 567 890
                </span>
              </a>

              <div className="flex items-center gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60">
                  <MapPin className="h-4 w-4 text-olive" />
                </span>

                <span className="text-sm text-muted-foreground">
                  Zyence Studio · Earth City, EC
                </span>
              </div>
            </div>
          </div>

          {/* Contact form */}
          <div className="relative md:col-span-7">
            {/* Offset frame */}
            <div
              aria-hidden
              className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-sm border border-olive/30 md:block"
            />

            <div className="relative rounded-sm border border-border/60 bg-background p-6 shadow-[var(--shadow-media)] md:p-10">
              <div className="mb-8">
                <p className="label-caps text-olive">Write to our studio</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  We usually reply within one working day.
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
