"use client";

import React, { useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import { Trail } from "./TrailText";

import LetsTalk from "./LetsTalk";
import MusicButton from "./MusicButton";
import ResumeButton from "./ResumeButton";
import Wordmark from "./Wordmark";
import useActiveSection from "./useActiveSection";
import { TABLET_MIN } from "../utils/useDeviceTier";
import { NAV_ITEMS, NAV_TARGETS, scrollToSection } from "./navItems";

import { CONTACT, PROFILE } from "../../data/profile";

const EMAIL = CONTACT.email;
const WHATSAPP_URL = CONTACT.whatsappUrl;
const RESUME_URL = CONTACT.resumeUrl;

function Navbar() {
  const [rotate, setRotate] = useSpring(() => ({
    transform: `rotate(0deg)`,
    config: { tension: 300, friction: 20, mass: 1 },
  }));

  const [open, set] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Underlines whichever section is currently in view, matching the
  // reference design where the active item reads white against the muted
  // rest of the row.
  const activeTarget = useActiveSection(NAV_TARGETS);

  useEffect(() => {
    set(true);
  }, []);

  // Lock body scroll while the mobile menu is open so the user doesn't
  // accidentally scroll the page behind the overlay.
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileOpen]);

  // The overlay is hidden by `md:hidden`, so once the bar switches to the inline
  // desktop layout the panel disappears visually but `mobileOpen` would stay
  // true — leaving body overflow locked and the page silently unscrollable.
  // Rotating a phone to landscape crosses this boundary, so close on the way up.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = window.matchMedia(`(min-width: ${TABLET_MIN}px)`);
    const close = (event) => {
      if (event.matches) {
        setMobileOpen(false);
        setRotate({ transform: "rotate(0deg)" });
      }
    };
    query.addEventListener("change", close);
    return () => query.removeEventListener("change", close);
  }, []);

  // Desktop: the links live in the bar itself, so a click only has to
  // scroll — there's no panel to dismiss first.
  const handleDesktopNav = (e, target) => {
    e.preventDefault();
    scrollToSection(target);
  };

  const handleMobileNav = (e, target) => {
    e.preventDefault();
    setMobileOpen(false);
    setRotate({ transform: "rotate(0deg)" });
    // Give the overlay a frame to close before scrolling so the user
    // sees the motion rather than a jumpy pre-scroll flash.
    setTimeout(() => scrollToSection(target), 50);
  };

  return (
    <>
      {/* ── Navbar, small screens ──────────────────────────────────────
          z-[100001] keeps the navbar on top of every other layer —
          including the footer (z: 100000) and the GradualBlur overlay
          (z: 99999) — so it's always reachable and never clipped by
          another stacking context. */}
      <div className="fixed top-0 left-0 z-[100001] w-full py-5 md:hidden px-5">
        <div className="flex items-center justify-between w-full">
          <Wordmark onClick={(e) => handleMobileNav(e, "top")} />
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="nav_btn_sm flex items-center justify-center cursor-pointer"
            onMouseEnter={() => !mobileOpen && setRotate({ transform: "rotate(90deg)" })}
            onMouseLeave={() => !mobileOpen && setRotate({ transform: "rotate(0deg)" })}
            onClick={() => {
              const next = !mobileOpen;
              setMobileOpen(next);
              setRotate({ transform: next ? "rotate(45deg)" : "rotate(0deg)" });
            }}
          >
            <animated.div className="text-[0.55rem] leading-none" style={rotate}>
              {mobileOpen ? "✕" : "⬤ ⬤"}
            </animated.div>
          </button>
        </div>
      </div>

      {/* ── Mobile menu overlay ────────────────────────────────────────
          Full-viewport panel below the navbar, carrying the same links as
          the desktop bar plus the contact actions. */}
      <div
        className={`fixed inset-0 z-[100000] md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!mobileOpen}
      >
        <div
          className="absolute inset-0 bg-bg"
          onClick={() => {
            setMobileOpen(false);
            setRotate({ transform: "rotate(0deg)" });
          }}
        />
        <div className="relative z-10 h-full w-full flex flex-col pt-28 pb-8 px-6">
          <nav className="flex flex-col">
            {NAV_ITEMS.map((item, i) => (
              <a
                key={item.target}
                href={item.target === "top" ? "#" : `#${item.target}`}
                onClick={(e) => handleMobileNav(e, item.target)}
                className={`group flex items-baseline gap-4 py-4 border-b border-theme-border transition-colors duration-200 ${
                  activeTarget === item.target ? "text-fg" : "text-fg-muted"
                } hover:text-fg`}
                style={{
                  transform: mobileOpen ? "translateY(0)" : "translateY(20px)",
                  opacity: mobileOpen ? 1 : 0,
                  transition: `transform 0.4s ease ${0.05 + i * 0.05}s, opacity 0.4s ease ${
                    0.05 + i * 0.05
                  }s, color 0.2s ease`,
                }}
              >
                <span className="font-mono text-[0.6rem] tracking-[0.2em] text-fg-subtle">
                  0{i + 1}
                </span>
                <span
                  className="font-mono text-2xl uppercase tracking-[0.12em]"
                >
                  {item.label}
                </span>
              </a>
            ))}
          </nav>

          <div className="mt-auto pt-8 flex flex-col gap-3">
            <p className="font-mono text-fg-subtle text-[0.6rem] tracking-[0.3em] uppercase">
              Get in touch
            </p>
            <a
              href={`mailto:${EMAIL}`}
              onClick={() => setMobileOpen(false)}
              className="nav_cta w-full"
            >
              EMAIL
            </a>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setMobileOpen(false)}
              className="nav_cta w-full"
            >
              WHATSAPP
            </a>
            <a
              href={RESUME_URL}
              download={`${PROFILE.fullName.replace(/\s+/g, "_")}_Resume.pdf`}
              onClick={() => setMobileOpen(false)}
              className="nav_cta w-full"
            >
              DOWNLOAD RESUME
            </a>
          </div>
        </div>
      </div>

      {/* ── Navbar, large screens ──────────────────────────────────────
          Inline row: wordmark left, nav links centre-right, then the theme
          toggle and CTA. Everything sits in the bar itself, so there's no
          dropdown panel on desktop any more. */}
      {/* Shown from `md:` (768px) rather than `lg:` (1024px): a landscape
          tablet has room for the real nav, and the single lg cutover was
          handing every tablet the phone hamburger. Spacing and padding step up
          at lg so the desktop bar is unchanged, while the 768-1023px band gets
          a condensed version that still fits on one line. */}
      <div className="fixed top-0 left-0 w-full px-6 lg:px-20 z-[100001]">
        <div className="hidden md:flex items-center justify-between pt-6 pb-5 lg:pt-8 lg:pb-6">
          <Wordmark onClick={(e) => handleDesktopNav(e, "top")} />

          <div className="flex items-center gap-4 lg:gap-10">
            <nav className="flex items-center gap-4 lg:gap-9">
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.target}
                  href={item.target === "top" ? "#" : `#${item.target}`}
                  onClick={(e) => handleDesktopNav(e, item.target)}
                  aria-current={activeTarget === item.target ? "true" : undefined}
                  className={`nav_link cursor-pointer ${
                    activeTarget === item.target ? "nav_link_active" : ""
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <Trail open={open} className="flex items-center gap-3">
              <MusicButton />
              <ResumeButton />
              <LetsTalk />
            </Trail>
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
