"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { EXPERIENCE } from "../../data/profile";
import SplitText from "../utils/SplitText";
import usePrefersReducedMotion from "../utils/usePrefersReducedMotion";
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
 * `kind` is a display string like "Apr 2026 — Present". The data is ordered
 * newest-first, so the span runs from the *last* role's start to the *first*
 * role's end. Splitting on the em dash avoids adding start/end fields to
 * data/profile.js for something that is purely presentational.
 */
const companySpan = (roles) => {
  const [start] = roles[roles.length - 1].kind.split("—").map((s) => s.trim());
  const end = roles[0].kind.split("—").map((s) => s.trim())[1];
  return end ? `${start} — ${end}` : start;
};

const isCurrent = (role) => /present/i.test(role.kind);

const Experience = () => {
  const sectionRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const groups = groupByCompany(EXPERIENCE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Skipping the context entirely leaves the markup at its final state —
    // no tween means nothing to reset.
    if (reducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // Per-element triggers, not one section-level trigger: the timeline is
      // taller than the viewport, so a single trigger on sectionRef fired every
      // group's tween at once and the lower entries finished off-screen.
      const reveal = (el, vars) =>
        gsap.from(el, {
          ease: "power3.out",
          ...vars,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            // Reverses on scroll-up for a genuine in/out transition.
            toggleActions: "play reverse play reverse",
          },
        });

      sectionRef.current.querySelectorAll(".xp-group").forEach((group) => {
        reveal(group, { opacity: 0, y: 40, duration: 0.8 });

        // scaleY, not height: animating height would reflow the grid every
        // frame. Scoped per group so each spine draws as its entry arrives.
        reveal(group.querySelector(".xp-spine-line"), {
          scaleY: 0,
          transformOrigin: "top center",
          duration: 1.1,
          ease: "power2.out",
        });

        reveal(group.querySelectorAll(".xp-company .split-char"), {
          opacity: 0,
          yPercent: 110,
          duration: 0.7,
          stagger: 0.02,
        });

        // Role titles stagger after the company name so the entry reads
        // top-down rather than everything arriving on the same beat.
        const roleChars = group.querySelectorAll(".xp-role-title .split-char");
        if (roleChars.length) {
          reveal(roleChars, {
            opacity: 0,
            yPercent: 110,
            duration: 0.5,
            stagger: 0.012,
            delay: 0.1,
          });
        }
      });

      const head = sectionRef.current.querySelector(".pj-head");
      reveal(head.querySelector(".pj-label"), {
        opacity: 0,
        y: 20,
        duration: 0.6,
      });
      reveal(head.querySelectorAll(".pj-title .split-char"), {
        opacity: 0,
        yPercent: 110,
        duration: 0.8,
        stagger: 0.02,
      });
    }, sectionRef.current);

    return () => ctx.revert();
  }, [reducedMotion]);

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
