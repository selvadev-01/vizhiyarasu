"use client";

import { useEffect, useState } from "react";

// Tracks which nav target is currently in view so the navbar can underline
// it. Uses one IntersectionObserver over every section rather than a scroll
// listener, so it costs nothing while the user is idle and stays in sync
// with Lenis' smooth scrolling without us having to sample scrollY.
//
// `rootMargin` pulls the detection band toward the upper third of the
// viewport: a section counts as "active" once its top reaches roughly where
// the reader's eye sits, not when it first peeks in from the bottom.
//
// The "top" sentinel (the hero) has no element of its own, so it's handled
// separately — whenever the page is scrolled near the very top, that wins
// regardless of what the observer reports.
export default function useActiveSection(targets) {
  const [active, setActive] = useState(targets[0] ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ids = targets.filter((t) => t !== "top");
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    // Records the most recent intersection ratio per section id so we can
    // pick the most-visible one rather than whichever fired last.
    const ratios = new Map();

    const pickActive = () => {
      if (window.scrollY < window.innerHeight * 0.5) {
        setActive("top");
        return;
      }
      let best = null;
      let bestRatio = 0;
      ratios.forEach((ratio, id) => {
        if (ratio > bestRatio) {
          bestRatio = ratio;
          best = id;
        }
      });
      if (best) setActive(best);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          ratios.set(entry.target.id, entry.intersectionRatio);
        });
        pickActive();
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
      }
    );

    elements.forEach((el) => observer.observe(el));

    // The observer alone can't tell us we've returned to the hero, because
    // the hero isn't one of the observed elements.
    //
    // rAF-coalesced: Lenis emits scroll events far more often than once per
    // frame, and every raw call walked the ratios map and hit setActive —
    // enough redundant Navbar renders to show up as scroll jank. Collapsing
    // to one check per frame is visually identical.
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        pickActive();
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    pickActive();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [targets]);

  return active;
}
