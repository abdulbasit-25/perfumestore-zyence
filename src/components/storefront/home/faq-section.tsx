import { Plus } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqEntry } from "@/lib/mock-data";

type FaqSectionProps = {
  items: FaqEntry[];
};

export function FaqSection({ items }: FaqSectionProps) {
  return (
    <section className="rule-top mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
      <div className="grid gap-y-6 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="label-caps text-olive">FAQ</p>
          <h2 className="font-display mt-3 text-3xl md:text-4xl">Good questions, answered</h2>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Can't find it here? Reach us any time.
          </p>
        </div>
        <div className="md:col-span-8">
          <Accordion type="single" collapsible className="w-full">
            {items.map((item) => (
              <AccordionItem key={item.id} value={item.id} className="border-border/60 first:mt-0">
                <AccordionTrigger className="label-caps group flex flex-1 items-center justify-between py-5 text-left text-base transition-colors hover:text-olive">
                  {item.question}
                  <Plus className="h-4 w-4 shrink-0 opacity-60 transition-transform duration-300 group-data-[state=open]:rotate-45 group-data-[state=open]:text-olive" />
                </AccordionTrigger>
                <AccordionContent className="pb-6 text-sm leading-relaxed text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
