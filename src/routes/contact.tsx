import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/storefront/contact-form";
import { StoreShell } from "@/components/storefront/shell";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  return (
    <StoreShell>
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
        <div className="relative overflow-hidden">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -right-4 -top-16 hidden select-none font-display text-[18rem] italic leading-none text-olive/[0.06] sm:block"
          >
            &amp;
          </span>
          <div className="rise relative max-w-2xl">
            <p className="label-caps text-olive">Get in touch</p>
            <h1 className="display-xl mt-4 text-foreground">Say hello.</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              Questions about an order, a wholesale account, or just want to talk shop, we read
              every message and reply within one business day.
            </p>
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-hairline px-3 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-olive opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-olive" />
              </span>
              <span className="text-xs text-muted-foreground">Usually replies within 24 hours</span>
            </div>
          </div>
        </div>

        <div className="rule-top mt-16 grid grid-cols-1 gap-16 pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-0">
          <div className="rise rise-delay-80 space-y-12">
            <div>
              <p className="label-caps text-muted-foreground">Email</p>
              <a
                href="mailto:abdulbasit.alpha25@gmail.com"
                className="link-underline mt-2 inline-block text-lg text-foreground"
              >
                abdulbasit.alpha25@gmail.com
              </a>
            </div>
            <div>
              <p className="label-caps text-muted-foreground">Phone</p>
              <a
                href="tel:+923415878569"
                className="link-underline mt-2 inline-block text-lg text-foreground"
              >
                +92 341 5878569
              </a>
            </div>
            <div>
              <p className="label-caps text-muted-foreground">Studio</p>
              <p className="mt-2 text-lg text-foreground">
                1234 Sorrel Street
                <br />
                Earth City, EC 12345
              </p>
            </div>
            <div>
              <p className="label-caps text-muted-foreground">Hours</p>
              <p className="mt-2 text-lg text-foreground">
                Monday - Friday
                <br />
                9:00 - 17:00 PT
              </p>
            </div>
            <div>
              <p className="label-caps text-muted-foreground">Follow</p>
              <div className="mt-3 flex gap-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Follow us on Instagram"
                  className="group flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-olive hover:bg-olive/5 hover:text-olive"
                >
                  <Instagram className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                </a>
                <a
                  href="https://wa.me/923415878569"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Chat with us on WhatsApp"
                  className="group flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all duration-300 hover:-translate-y-0.5 hover:border-olive hover:bg-olive/5 hover:text-olive"
                >
                  <MessageCircle className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                </a>
              </div>
            </div>
          </div>

          <div className="rise rise-delay-160 lg:border-l lg:border-hairline lg:pl-16">
            <ContactForm />
          </div>
        </div>
      </div>
    </StoreShell>
  );
}
