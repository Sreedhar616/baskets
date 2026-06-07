"use client";

import { useEffect } from "react";
import { InstagramIcon } from "@/components/ui/icons";
import type { InstagramPost } from "@/types/db";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
  }
}

const EMBED_SCRIPT = "https://www.instagram.com/embed.js";

/** Loads Instagram's embed.js once and (re)processes blockquotes into rich posts. */
function useInstagramEmbeds(count: number) {
  useEffect(() => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${EMBED_SCRIPT}"]`
    );
    if (!existing) {
      const s = document.createElement("script");
      s.src = EMBED_SCRIPT;
      s.async = true;
      s.onload = () => window.instgrm?.Embeds.process();
      document.body.appendChild(s);
    } else {
      window.instgrm?.Embeds.process();
    }
  }, [count]);
}

/**
 * Renders curated Instagram posts. Uses the official embed (blockquote +
 * embed.js). Each card also links out so it degrades gracefully if a post
 * can't be embedded.
 */
export function InstagramGrid({ posts }: { posts: InstagramPost[] }) {
  useInstagramEmbeds(posts.length);

  if (!posts.length) {
    return (
      <p className="text-center text-ink-soft">No posts yet — check back soon!</p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="overflow-hidden rounded-2xl border border-border bg-cream"
        >
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={post.postUrl}
            data-instgrm-version="14"
            style={{ margin: 0, width: "100%", minWidth: "100%" }}
          >
            <a
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-8 text-sm text-clay"
            >
              <InstagramIcon size={18} />
              View on Instagram
            </a>
          </blockquote>
          {post.caption && (
            <p className="border-t border-border px-4 py-3 text-sm text-ink-soft">
              {post.caption}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
