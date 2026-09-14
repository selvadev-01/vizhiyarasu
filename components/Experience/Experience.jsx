"use client";

import React, { useCallback, useRef } from "react";

import { EXPERIENCE } from "../../data/profile";
import SplitText from "../utils/SplitText";
import usePrefersReducedMotion from "../utils/usePrefersReducedMotion";
import useScrollReveal from "../utils/useScrollReveal";
import "./Experience.css";

/**
 * Folds consecutive roles at the same company into one node.
 *
 * Two of the roles are a promotion at the same employer; rendering them as two
 * unrelated entries hides the progression. Only *consecutive* matches collapse
 * — someone who left a company and returned later should read as two separate
 * stints, not one continuous one.
 */
const groupByCompany = (roles) =>
  roles.reduce((groups, role) => {
    const last = groups[groups.length - 1];
    if (last && last.company === role.name) {
      last.roles.push(role);
      return groups;
    }
    groups.push({ company: role.name, roles: [role] });
    return groups;
  }, []);

/**
 * Derives a company's overall span from its roles rather than storing it.
 *
 * `kind` is a display string like "Apr 2026 - Present". The data is ordered
 * newest-first, so the span runs from the *last* role's start to the *first*
 * role's end. Deriving it avoids adding start/end fields to data/profile.js
 * for something that is purely presentational.
 *
 * The split accepts a hyphen, en dash or em dash. The data now uses a plain
 * hyphen throughout, but a range separator is exactly the kind of character
 * that gets pasted back in from a resume or a CV editor, and a parser that
 * silently returned the whole string as `start` would drop the end date with
 * no visible error.
 */
const RANGE_SEPARATOR = /\s*[-–—]\s*/;

const companySpan = (roles) => {
  const [start] = roles[roles.length - 1].kind.split(RANGE_SEPARATOR);
  const end = roles[0].kind.split(RANGE_SEPARATOR)[1];
  return end ? `${start.trim()} - ${end.trim()}` : start.trim();
};

const isCurrent = (role) => /present/i.test(role.kind);

const Experience = () => {
  const sectionRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const groups = groupByCompany(EXPERIENCE);

  // Per-element triggers, not one section-level trigger: the timeline is taller
  // than the viewport, so a single trigger on sectionRef fired every group's
  // tween at once and the lower entries finished off-screen.
  const build = useCallback((reveal, tier) => {
    sectionRef.current.querySelectorAll(".xp-group").forEach((group) => {
      reveal(group, {
        opacity: 0,
        y: tier.revealDistance,
        x: tier.slideX,
        duration: tier.revealDuration,
      });

      // scaleY, not height: animating height would reflow the grid every
      // frame. Scoped per group so each spine draws as its entry arrives.
      // This is the section's signature move, so it survives on every tier;
      // only its duration scales down.
      reveal(group.querySelector(".xp-spine-line"), {
        scaleY: 0,
        transformOrigin: "top center",
        duration: tier.revealDuration * 1.3,
        ease: "power2.out",
      });

      reveal(group.querySelectorAll(".xp-company .split-char"), {
        opacity: 0,
        yPercent: 110,
        duration: tier.revealDuration * 0.8,
        stagger: tier.charStagger * 1.6,
      });

      // Role titles stagger after the company name so the entry reads
      // top-down rather than everything arriving on the same beat.
      const roleChars = group.querySelectorAll(".xp-role-title .split-char");
      if (roleChars.length) {
        reveal(roleChars, {
          opacity: 0,
          yPercent: 110,
          duration: tier.revealDuration * 0.6,
          stagger: tier.charStagger,
          delay: 0.1,
        });
      }
    });

    const head = sectionRef.current.querySelector(".pj-head");
    reveal(head.querySelector(".pj-label"), {
      opacity: 0,
      y: 20,
      duration: tier.revealDuration * 0.7,
    });
    reveal(head.querySelectorAll(".pj-title .split-char"), {
      opacity: 0,
      yPercent: 110,
      duration: tier.revealDuration * 0.85,
      stagger: tier.charStagger * 1.6,
    });
  }, []);

  useScrollReveal({ scopeRef: sectionRef, reducedMotion, build });

  return (
    <div ref={sectionRef}>
      {/* The id stays "ventures" because Navbar, Menu, SiteFooter and
          useActiveSection all anchor-link to it. The heading keeps the shared
          pj- classes so it stays visually identical to its sibling sections —
          only the list below it was redesigned. */}
      <div id="ventures" className="pj-head pj-head--secondary">
        <span className="pj-label">EXPERIENCE</span>
        <SplitText as="h2" className="pj-title" text="work experience" />
      </div>

      <ol className="xp-timeline">
        {groups.map((group) => (
          <li className="xp-group" key={group.company}>
            <div className="xp-spine" aria-hidden="true">
              <span
                className={`xp-node${
                  group.roles.some(isCurrent) ? " xp-node--current" : ""
                }`}
              />
              <span className="xp-spine-line" />
            </div>

            <div className="xp-body">
              <div className="xp-company-head">
                <SplitText
                  as="h3"
                  className="xp-company"
                  text={group.company}
                />
                <span className="xp-span">
                  <time>{companySpan(group.roles)}</time>
                </span>
              </div>

              <ol className="xp-roles">
                {group.roles.map((role) => (
                  <li className="xp-role" key={role.role}>
                    <div className="xp-role-head">
                      <SplitText
                        as="h4"
                        className="xp-role-title"
                        text={role.role}
                      />
                      <span className="xp-dates">
                        <time>{role.kind}</time>
                      </span>
                      {/* Text, not just colour — a dot alone would carry the
                          meaning in hue only. */}
                      {isCurrent(role) && (
                        <span className="xp-badge">Current</span>
                      )}
                    </div>
                    {role.note && <p className="xp-note">{role.note}</p>}
                  </li>
                ))}
              </ol>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Experience;
