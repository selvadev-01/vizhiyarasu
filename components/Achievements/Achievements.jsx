"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { ACHIEVEMENTS } from "../../data/profile";
import { ToolsCopy, ToolsOrbit } from "../ui/integrations-section";
import "./Achievements.css";

/**
 * Achievements ledger, paired with the tools orbit in a two-column split.
 *
 * The orbit used to render as its own full-width band immediately after this
 * one (`<IntegrationsSection />` in app/page.js). Two consecutive full-width
 * bands — "what I achieved", then "what I work with" — read as two separate
 * statements when they are really one: the proof and the means. Side by side,
 * the ledger's ordered claims are what the eye reads while the orbit sits as
 * the standing illustration beside them.
 *
 * The right column is `position: sticky` on desktop so the orbit stays in view
 * for the whole scroll past the ledger — the ledger is the taller column, and
 * an orbit that scrolls away after the second row wastes the pairing.
 *
 * Replaces the MagicBento card grid this section used to render. The cards set
 * every achievement at equal visual weight and stacked five bordered surfaces
 * directly beneath the Experience timeline's open ruled layout; this reads as
 * one continuous block in the same typographic language as its neighbour.
 *
 * The accent edge on each row carries over the intent of the old border glow —
 * present at rest, intensifying as the pointer arrives — but as a CSS-only
 * hover rather than the per-frame pointer tracking MagicBento ran. That
 * tracking cost a mousemove handler on document plus imperative particle nodes
 * for an effect a touch user could never trigger; a hover transition gets the
 * same read for free. See Achievements.css for the resting/hover values.
 */

/**
 * Gates the GSAP reveal on an OS reduced-motion request.
 *
 * The prefers-reduced-motion block in app/globals.css only collapses CSS
 * durations — GSAP tweens are JS-driven and ignore it entirely, so they have to
 * be gated here. Matches Experience.jsx: no viewport gate, because a one-shot
 * scroll reveal is cheap and appropriate on phones.
 */
const usePrefersReducedMotion = () => {
  // `false` is the SSR-safe seed: the server can't know the user's setting, so
  // the first client render must match it and correct in the effect.
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
};

const Achievements = () => {
  const sectionRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Skipping the context entirely leaves the markup at its final state —
    // no tween means nothing to reset.
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.from(".ach-item", {
        opacity: 0,
        y: 32,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, [reducedMotion]);

  if (!ACHIEVEMENTS.length) return null;

  return (
    <div ref={sectionRef}>
      {/* The id stays "achievements" because Navbar, Menu, SiteFooter and
          useActiveSection anchor-link to it. The heading keeps the shared pj-
          classes so it stays visually identical to its sibling sections — only
          the content below it changed. */}
      <div id="achievements" className="pj-head pj-head--secondary">
        <span className="pj-label">ACHIEVEMENTS &amp; TOOLING</span>
        <h2 className="pj-title">highlights &amp; stack</h2>
      </div>

      <div className="ach-split">
        <ol className="ach-ledger">
          {ACHIEVEMENTS.map((item, i) => (
            <li className={`ach-item${i === 0 ? " ach-item--lead" : ""}`} key={item.title}>
              {/* aria-hidden: <ol> already conveys the ordering to assistive
                  tech, so reading a bare number before every row is redundant.
                  The numeral here is the visual expression of that same order. */}
              <span className="ach-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="ach-body">
                <span className="ach-label">{item.label}</span>
                <h3 className="ach-title">{item.title}</h3>
                <p className="ach-desc">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>

        {/* Keeps the #skills id the standalone IntegrationsSection carried, so
            any existing link to the tools block still lands somewhere real now
            that the section itself is no longer on the home page. */}
        <aside id="skills" className="ach-tools">
          <div className="ach-tools__inner">
            <ToolsOrbit className="ach-tools__orbit" />
            <ToolsCopy className="ach-tools__copy" />
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Achievements;
