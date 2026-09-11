"use client";

import React, { useCallback, useRef } from "react";

import { EDUCATION, PROJECTS } from "../../data/profile";
import Achievements from "../Achievements/Achievements";
import Experience from "../Experience/Experience";
import SplitText from "../utils/SplitText";
import usePrefersReducedMotion from "../utils/usePrefersReducedMotion";
import useScrollReveal from "../utils/useScrollReveal";

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

  // Each element gets its own trigger. An earlier version pointed every trigger
  // at sectionRef, which spans Projects + Experience + Education + Achievements,
  // so the whole section played the moment its top edge appeared and everything
  // below the fold finished animating off-screen.
  const build = useCallback((reveal, tier) => {
    sectionRef.current.querySelectorAll(".pj-row").forEach((row, i) => {
      reveal(row, {
        opacity: 0,
        y: tier.revealDistance,
        // Horizontal drift is mobile-only (0 on desktop). On a narrow screen
        // rows stack vertically with little else moving, so a slight sideways
        // settle gives the entrance a direction instead of a flat fade.
        x: tier.slideX,
        scale: tier.scaleFrom,
        duration: tier.revealDuration,
        // Indexed delay rather than a `stagger` on one tween: each row owns its
        // own ScrollTrigger, so they never share a timeline to stagger across.
        // Capped so a long list does not accumulate a visible wait.
        delay: Math.min(i, 3) * tier.revealStagger,
      });

      // Characters ride on top of the row fade, so the name assembles as the
      // row arrives instead of animating as one solid block.
      const chars = row.querySelectorAll(".pj-name .split-char");
      if (chars.length) {
        reveal(chars, {
          opacity: 0,
          yPercent: 110,
          duration: tier.revealDuration * 0.7,
          stagger: tier.charStagger,
        });
      }
    });

    // :scope > .pj-head, not a bare descendant sweep: Experience and
    // Achievements render inside this section and animate their own headings.
    // A descendant query claimed those too, so two ScrollTriggers fought over
    // the same chars and left the losing tween's heading parked at opacity 0.
    sectionRef.current.querySelectorAll(":scope > .pj-head").forEach((head) => {
      reveal(head.querySelector(".pj-label"), {
        opacity: 0,
        y: 20,
        duration: tier.revealDuration * 0.7,
      });

      const chars = head.querySelectorAll(".pj-title .split-char");
      reveal(chars, {
        opacity: 0,
        yPercent: 110,
        duration: tier.revealDuration * 0.85,
        stagger: tier.charStagger * 1.6,
      });
    });
  }, []);

  useScrollReveal({ scopeRef: sectionRef, reducedMotion, build });

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
