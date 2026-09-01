"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { EDUCATION, PROJECTS } from "../../data/profile";
import Achievements from "../Achievements/Achievements";
import Experience from "../Experience/Experience";
import SplitText from "../utils/SplitText";
import usePrefersReducedMotion from "../utils/usePrefersReducedMotion";

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="100%"
    height="100%"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7 17 17 7" />
    <path d="M8 7h9v9" />
  </svg>
);

const Row = ({ item, index }) => {
  const hasLink = Boolean(item.href);
  const Wrapper = hasLink ? "a" : "div";
  const wrapperProps = hasLink
    ? { href: item.href, target: "_blank", rel: "noreferrer" }
    : {};

  return (
    <li className="pj-row">
      <Wrapper
        className={`pj-link${hasLink ? "" : " pj-link--static"}`}
        {...wrapperProps}
      >
        <span className="pj-num">{String(index + 1).padStart(2, "0")}</span>
        <div className="pj-meta">
          {/* Only .pj-name is split per-character. The supporting lines are set
              small enough that a per-char stagger reads as jitter rather than
              motion, so they ride the row's own fade instead. */}
          <SplitText className="pj-name" text={item.name} />
          {item.role && <span className="pj-role">{item.role}</span>}
          {item.note && <span className="pj-note">{item.note}</span>}
        </div>
        <span className="pj-kind">{item.kind}</span>
        <span className="pj-arrow" aria-hidden="true">
          {hasLink ? <ArrowIcon /> : <span className="pj-dot">•</span>}
        </span>
      </Wrapper>
    </li>
  );
};

const Projects = () => {
  const sectionRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Skipping the context entirely leaves the markup at its final state —
    // no tween means nothing to reset.
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Each element gets its own trigger. The previous version pointed every
      // trigger at sectionRef, which spans Projects + Experience + Education +
      // Achievements — so the whole section played out the moment its top edge
      // appeared, and everything below the fold finished animating off-screen.
      // That's why Education in particular looked like it had no transition.
      const reveal = (el, vars) =>
        gsap.from(el, {
          ease: "power3.out",
          ...vars,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            // Reverses on the way back up, giving a real in/out transition
            // rather than the one-shot `once: true` reveal used before.
            toggleActions: "play reverse play reverse",
          },
        });

      sectionRef.current.querySelectorAll(".pj-row").forEach((row) => {
        reveal(row, { opacity: 0, y: 60, duration: 0.9 });

        // Characters ride on top of the row fade, so the name assembles as the
        // row arrives instead of animating as one solid block.
        const chars = row.querySelectorAll(".pj-name .split-char");
        if (chars.length) {
          reveal(chars, {
            opacity: 0,
            yPercent: 110,
            duration: 0.6,
            stagger: 0.012,
          });
        }
      });

      // :scope > .pj-head, not a bare descendant sweep: Experience and
      // Achievements render inside this section and animate their own headings.
      // A descendant query claimed those too, so two reversing ScrollTriggers
      // fought over the same chars and left the losing tween's heading parked
      // at opacity 0 — Experience's title never showed.
      sectionRef.current.querySelectorAll(":scope > .pj-head").forEach((head) => {
        reveal(head.querySelector(".pj-label"), {
          opacity: 0,
          y: 20,
          duration: 0.6,
        });

        const chars = head.querySelectorAll(".pj-title .split-char");
        reveal(chars, {
          opacity: 0,
          yPercent: 110,
          duration: 0.8,
          stagger: 0.02,
        });
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section id="projects-section" ref={sectionRef}>
      <div className="pj-head">
        <span className="pj-label">PROJECTS</span>
        <SplitText as="h2" className="pj-title" text="selected work" />
      </div>

      <ul className="pj-list">
        {PROJECTS.map((p, i) => (
          <Row key={p.name} item={p} index={i} />
        ))}
      </ul>

      {/* Experience owns its own heading (including the #ventures anchor) and
          a timeline layout instead of .pj-row list items — work history is
          date-ranged, non-linkable content that the shared Row doesn't serve.
          It renders no .pj-row, so the reveal above deliberately skips it and
          the component runs its own gated tweens. */}
      <Experience />

      <div id="education" className="pj-head pj-head--secondary">
        <span className="pj-label">EDUCATION</span>
        <SplitText as="h2" className="pj-title" text="learning & training" />
      </div>

      <ul className="pj-list">
        {EDUCATION.map((item, i) => (
          <Row key={item.name} item={item} index={i} />
        ))}
      </ul>

      {/* Achievements owns its own heading (including the #achievements
          anchor) and a ledger layout, for the same reason Experience does:
          they're claims, not linkable named things, so the shared Row would
          squash each onto a .pj-name line with an empty .pj-kind column. It
          renders no .pj-row, so the reveal above deliberately skips it and the
          component runs its own gated tween. */}
      <Achievements />
    </section>
  );
};

export default Projects;
