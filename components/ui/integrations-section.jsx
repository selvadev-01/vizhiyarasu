import { Bot, Bug, Container, FlaskConical, GitBranch, Send, ShieldCheck } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { CONTACT } from "@/data/profile";
import { cn } from "@/lib/utils";

/**
 * Orbit nodes. The outer ring holds the tools used most day-to-day; the inner
 * ring holds the supporting stack. Each entry is a lucide icon plus a label
 * used for the accessible title — the orbit is decorative, so the labels are
 * exposed to screen readers rather than drawn on screen (there is no room).
 *
 * These mirror the real tools listed in `SKILLS` in data/profile.js. They are
 * declared here rather than derived from that array because the orbit has
 * exactly six fixed slots with hand-tuned positions — it is a layout, not a
 * list, and silently dropping or overflowing entries if SKILLS grows would be
 * worse than keeping the two in deliberate sync.
 */
const OUTER_RING = [
  { icon: FlaskConical, label: "Katalon Studio" },
  { icon: Bug, label: "Selenium" },
  { icon: Send, label: "Postman" },
];

const INNER_RING = [
  { icon: GitBranch, label: "Git & GitHub Actions" },
  { icon: Bot, label: "AI-assisted automation" },
  { icon: ShieldCheck, label: "OWASP ZAP & Burp Suite" },
];

/**
 * The orbit visual on its own, with no section chrome or copy.
 *
 * Split out of `IntegrationsSection` when the tools block moved into the
 * Achievements two-column layout: that layout supplies its own heading, copy
 * and width constraints, so it needs the artwork without the `<section>`,
 * padding and `max-w-5xl` wrapper the standalone version carries. Both render
 * this same tree, so the ring geometry only exists once.
 *
 * `className` is merged onto the sizing wrapper so each caller can set the
 * max-width the orbit should fill in its own column.
 */
export function ToolsOrbit({ className }) {
  return (
    /* `group` drives the two spinning rings, which stay invisible until
       hover so the section is calm at rest. */
    <div
      className={cn(
        "group relative mx-auto flex aspect-[16/10] items-center justify-between",
        className,
      )}
    >
      {/* Spinning highlight rings — decorative, hover-only. */}
      <div
        role="presentation"
        className="absolute inset-0 z-10 aspect-square animate-spin items-center justify-center rounded-full border-t border-orbit-spin/40 bg-gradient-to-b from-orbit-spin/25 to-transparent to-[25%] opacity-0 transition-opacity duration-[3.5s] group-hover:opacity-100"
      />
      <div
        role="presentation"
        className="absolute inset-14 z-10 aspect-square scale-90 animate-spin items-center justify-center rounded-full border-t border-orbit-spin-alt/45 bg-gradient-to-b from-orbit-spin-alt/30 to-transparent to-[25%] opacity-0 transition-opacity duration-[3.5s] group-hover:opacity-100 sm:inset-20 md:inset-28 lg:inset-32"
      />

      {/* Outer ring + its three nodes. */}
      <div className="absolute inset-0 flex aspect-square items-center justify-center rounded-full border-t border-orbit-glow/25 bg-gradient-to-b from-orbit-glow/[0.16] to-transparent to-[25%]">
        <OrbitNode
          className="absolute left-0 top-1/4 -translate-x-[16.666%] -translate-y-1/4"
          {...OUTER_RING[0]}
        />
        <OrbitNode className="absolute top-0 -translate-y-1/2" {...OUTER_RING[1]} />
        <OrbitNode
          className="absolute right-0 top-1/4 -translate-y-1/4 translate-x-[16.666%]"
          {...OUTER_RING[2]}
        />
      </div>

      {/* Inner ring + its three nodes. */}
      <div className="absolute inset-14 flex aspect-square scale-90 items-center justify-center rounded-full border-t border-orbit-glow/25 bg-gradient-to-b from-orbit-glow/[0.16] to-transparent to-[25%] sm:inset-20 md:inset-28 lg:inset-32">
        <OrbitNode className="absolute top-0 -translate-y-1/2" {...INNER_RING[0]} />
        <OrbitNode
          className="absolute left-0 top-1/4 -translate-x-1/4 -translate-y-1/4"
          {...INNER_RING[1]}
        />
        <OrbitNode
          className="absolute right-0 top-1/4 -translate-y-1/4 translate-x-1/4"
          {...INNER_RING[2]}
        />
      </div>

      {/* Center lockup — the source's structure: a `bg-muted` collar
                around the node, which sits on `shadow-xl`. */}
      <div className="absolute inset-x-0 bottom-0 mx-auto my-2 flex w-fit justify-center gap-2">
        <div className="relative z-20 rounded-full border border-orbit-glow/20 bg-muted p-1">
          <OrbitNode
            className="size-16 border-orbit-glow/30 shadow-xl shadow-black/10 dark:bg-bg dark:shadow-white/15 sm:size-20 md:size-24"
            icon={Container}
            label="Quality engineering"
            isCenter
          />
        </div>
      </div>
    </div>
  );
}

/**
 * The copy that accompanies the orbit — headline, blurb, résumé link.
 *
 * Split out alongside `ToolsOrbit` for the same reason: the two-column
 * Achievements layout stacks these differently (left-aligned, under its own
 * section heading) than the standalone section does (centred, over the arcs),
 * but the words themselves must not fork.
 */
export function ToolsCopy({ className }) {
  return (
    <div className={cn("space-y-6", className)}>
      <h2 className="text-balance text-3xl font-semibold md:text-4xl">
        Tools &amp; tech I work with
      </h2>
      <p className="text-muted-foreground">
        The stack behind the testing — from automation frameworks and API tooling to the AI
        assistants that speed up the work.
      </p>

      {/* Default size rather than `sm`: the small variant renders at 36px,
          under the 44px touch minimum. The touch floor in globals.css lifts it
          the rest of the way on coarse-pointer devices. */}
      <Button variant="outline" asChild className="min-h-11">
        <Link href={CONTACT.resumeUrl} target="_blank" rel="noopener noreferrer">
          Download r&eacute;sum&eacute;
        </Link>
      </Button>
    </div>
  );
}

const OrbitNode = ({ icon: Icon, label, className, isCenter = false }) => {
  return (
    /* `tabIndex`/`role="img"` make the node a stop for keyboard users so the
       tooltip is reachable without a pointer. `aria-label` names it for
       assistive tech; the visible chip below is `aria-hidden` so the label
       isn't announced twice. */
    <div
      role="img"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "orbit-node relative z-30 flex size-12 rounded-full border border-orbit-glow/25 bg-bg-alt shadow-sm shadow-black/5 outline-none dark:bg-white/[0.07] dark:backdrop-blur-md sm:size-14 md:size-16",
        isCenter && "orbit-node-center",
        className,
      )}
    >
      <div
        className={cn(
          "m-auto size-fit",
          isCenter ? "*:size-8 sm:*:size-10 md:*:size-12" : "*:size-5 sm:*:size-6 md:*:size-7",
        )}
      >
        <Icon
          className={isCenter ? "text-accent" : "text-fg"}
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <span className="orbit-tip" aria-hidden="true">
        {label}
      </span>
    </div>
  );
};
