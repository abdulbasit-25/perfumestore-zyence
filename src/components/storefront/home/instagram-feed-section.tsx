import { ArrowUpRight, Instagram } from "lucide-react";
import type { InstagramPost } from "@/lib/mock-data";

type InstagramFeedSectionProps = {
  posts: InstagramPost[];
};

export function InstagramFeedSection({ posts }: InstagramFeedSectionProps) {
  return (
    <section className="rule-top mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="label-caps text-olive">@sorrel.atelier</p>
          <h2 className="font-display mt-3 text-3xl md:text-4xl">From our feed</h2>
        </div>
        <a
          href="https://instagram.com/sorrel.atelier"
          target="_blank"
          rel="noreferrer"
          className="label-caps link-underline group inline-flex items-center gap-1.5"
        >
          Follow us
          <ArrowUpRight className="h-3.5 w-3.5 -translate-x-0.5 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
          <Instagram className="h-3.5 w-3.5" />
        </a>
      </div>
      <div className="grid grid-cols-3 gap-px overflow-hidden rounded-sm bg-hairline sm:grid-cols-4 md:grid-cols-6">
        {posts.map((post) => (
          <a
            key={post.id}
            href="https://instagram.com/sorrel.atelier"
            target="_blank"
            rel="noreferrer"
            className="group relative aspect-square overflow-hidden bg-background"
          >
            <img
              src={post.image}
              alt={post.caption}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex items-center gap-1.5">
                <Instagram className="h-3.5 w-3.5 text-white" />
                <span className="label-caps text-xs text-white">View post</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
