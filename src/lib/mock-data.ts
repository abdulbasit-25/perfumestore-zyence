import shirt from "@/assets/p-linen-shirt.jpg";
import vase from "@/assets/p-vase.jpg";
import throwBlanket from "@/assets/p-throw.jpg";
import tote from "@/assets/p-tote.jpg";
import mugs from "@/assets/p-mugs.jpg";
import lamp from "@/assets/p-lamp.jpg";

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
};

export const faqEntries: FaqEntry[] = [
  {
    id: "f1",
    question: "How long is shipping?",
    answer:
      "Domestic orders typically ship within 2–3 business days and arrive within 4–6 days. International orders take 7–14 business days depending on destination. You will receive a tracking link once your fragrance order leaves our studio.",
  },
  {
    id: "f2",
    question: "How does pay on delivery work?",
    answer:
      "Pay on delivery (COD) is available for select regions. Place your order as usual, and our courier will collect payment in cash or local card on arrival. There is a small 3% service fee applied at checkout for COD orders.",
  },
  {
    id: "f3",
    question: "What is the return policy?",
    answer:
      "We accept returns within 14 days of delivery on sealed, unused fragrance products in their original packaging. Opened or tested fragrances are generally not eligible for hygiene reasons. Contact support with your order number before sending anything back.",
  },
  {
    id: "f4",
    question: "Do you ship worldwide?",
    answer:
      "Yes, we ship to most countries. Duties and import taxes are calculated and collected at checkout for supported regions; elsewhere, they may be due on arrival. COD is limited to domestic and a small number of neighbouring markets.",
  },
  {
    id: "f5",
    question: "How should I choose a fragrance?",
    answer:
      "Start with the notes and mood described on each product page. Discovery sets are ideal when you want to compare several compositions before choosing a full bottle. Our team can also help you choose by scent family.",
  },
  {
    id: "f6",
    question: "Can I cancel or change my order?",
    answer:
      "Orders can be cancelled or modified within 6 hours of placement while they are still in processing. After that, the order enters packing and we can no longer guarantee changes. Email our team directly with your order reference.",
  },
];

export type InstagramPost = {
  id: string;
  handle: string;
  caption: string;
  image: string;
};

export const instagramPosts: InstagramPost[] = [
  {
    id: "i1",
    handle: "@zyence_fragrance",
    caption:
      "Slow Saturday mornings with the cream mug pair. Wheel-thrown, satin-glazed, made to last.",
    image: mugs,
  },
  {
    id: "i2",
    handle: "@zyence_fragrance",
    caption:
      "The olive vase in the wild — sent in from a home in Porto. Each piece finds its own light.",
    image: vase,
  },
  {
    id: "i3",
    handle: "@zyence_fragrance",
    caption:
      "Washed European linen, now in the studio in four colours. Softens every time it goes through the machine.",
    image: shirt,
  },
  {
    id: "i4",
    handle: "@zyence_fragrance",
    caption:
      "Brass and walnut, hand-turned and finished in our workshop. Warm evenings begin early this season.",
    image: lamp,
  },
  {
    id: "i5",
    handle: "@zyence_fragrance",
    caption:
      "The lambswool throw, woven in a family mill outside Porto. A lifetime piece, not a season.",
    image: throwBlanket,
  },
  {
    id: "i6",
    handle: "@zyence_fragrance",
    caption: "Vegetable-tanned tote three months in. The patina belongs to whoever carries it.",
    image: tote,
  },
];
