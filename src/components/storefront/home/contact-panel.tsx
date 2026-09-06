import { Mail, MessageCircle, ArrowUpRight } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

export function ContactPanel() {
  return (
    <section className="mx-auto mt-20 max-w-[1500px] px-5 pb-4 md:mt-24 md:px-10">
      <div className="relative overflow-hidden rounded-sm border border-border/60 bg-surface px-6 py-10 sm:px-8 md:px-14 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-olive/10 blur-3xl"
        />
        <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-lg">
            <p className="label-caps text-olive">Want a store like this?</p>
            <h2 className="font-display mt-4 text-2xl leading-tight sm:text-3xl">
              This site is a working demo, built by ARCHER.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              For a storefront built to your brand, catalog and workflow, reach out directly.
            </p>
          </div>

          <div className="flex flex-col gap-3 md:min-w-[280px]">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="mailto:abdulbasit.alpha25@gmail.com"
                  className="group flex items-center justify-between rounded-sm border border-border/60 px-5 py-3.5 text-sm transition-all duration-300 hover:border-olive hover:bg-olive/5"
                >
                  <span className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-olive" />
                    abdulbasit.alpha25@gmail.com
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Get in touch via email</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://wa.me/923415878569"
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-sm border border-border/60 px-5 py-3.5 text-sm transition-all duration-300 hover:border-olive hover:bg-olive/5"
                >
                  <span className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-olive" />
                    +92 341 5878569
                  </span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Chat on WhatsApp</TooltipContent>
            </Tooltip>
            <p className="text-center text-xs text-muted-foreground">
              Available for remote work worldwide
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
