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
 * TikTok-style vertical reel viewer: full-height scroll-snap panels, one reel
 * per screen, smooth swipe between them. Uses the official Instagram embed.
 *
 * Note: Instagram embeds are sandboxed iframes, so we cannot programmatically
 * play/pause them — "only one plays at a time" isn't controllable here. The
 * snap layout keeps a single reel centred at a time, which is the best UX
 * achievable without switching to self-hosted videos.
 */
export function InstagramReels({ posts }: { posts: InstagramPost[] }) {
  useInstagramEmbeds(posts.length);

  if (!posts.length) {
    return (
      <p className="text-center text-ink-soft">No reels yet — check back soon!</p>
    );
  }

  return (
    <div
      className="no-scrollbar mx-auto max-w-[420px] snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-lg border border-border bg-cream"
      style={{ height: "min(80vh, 720px)" }}
    >
      {posts.map((post) => (
        <section
          key={post.id}
          className="flex min-h-full snap-start snap-always items-center justify-center p-3"
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
        </section>
      ))}
    </div>
  );
}
