"use client";
import { Suspense, useRef, useEffect } from "react";
// NOTE: Character/Experience (the r3f character scene) and HorizontalScroll are
// both commented out in the JSX below, but importing them still pulled
// @react-three/fiber, drei and rapier into the homepage bundle for every
// visitor. Re-add the import alongside the markup if either is revived.
import FeaturedVideo from "@/components/Featured/FeaturedVideo";
import Header from "@/components/Featured/Header";
import Skiggle from "@/components/Featured/Skiggle";
import SubHeader from "@/components/Featured/SubHeader";
import Description from "@/components/Navbar/Description";
import Navbar from "@/components/Navbar/Navbar";
import ScrollText from "@/components/Navbar/ScrollText";
import HeroSection from "@/components/HeroSection/HeroSection";
import SmoothScroll from "@/components/SmoothScroll";
import GradualBlur from "@/components/GradualBlur/GradualBlur";
import Projects from "@/components/Projects/Projects";
import Contact from "@/components/Contact/Contact";
import SiteFooter from "@/components/SiteFooter/SiteFooter";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function Home() {
  const ref = useRef(null);
  const blurRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    console.clear();
    console.log(
      "%cCREATED BY MTARIF.COM",
      "background: #D9E6FF; color: #0f172a; font-size: 16px; font-weight: 800; padding: 10px 16px; border-radius: 10px; letter-spacing: 2px;",
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    gsap.registerPlugin(ScrollTrigger);

    const blur = blurRef.current;
    const footer = document.getElementById("main-footer");
    if (!blur || !footer) return;

    // The GradualBlur effect should be visible across the whole site, but
    // disabled while the footer is on screen — the footer is the one
    // component that opts out of the blur. Compute the initial visibility
    // from the footer's current viewport position so a hard reload anywhere
    // on the page lands in the correct state, then keep it in sync as the
    // user scrolls past the footer in either direction.
    const setVisible = (visible) => gsap.to(blur, { autoAlpha: visible ? 1 : 0, duration: 0.3 });

    const footerInView = footer.getBoundingClientRect().top < window.innerHeight;
    gsap.set(blur, { autoAlpha: footerInView ? 0 : 1 });

    const trigger = ScrollTrigger.create({
      trigger: footer,
      start: "top bottom",
      end: "bottom top",
      onEnter: () => setVisible(false),
      onEnterBack: () => setVisible(false),
      onLeave: () => setVisible(false),
      onLeaveBack: () => setVisible(true),
    });

    return () => trigger.kill();
  }, []);

  return (
    <SmoothScroll>
      <Suspense
        fallback={
          <div className="w-screen bg-black h-screen text-white text-4xl md:text-7xl lg:text-9xl flex items-center justify-center">
            Loading...
          </div>
        }
      >
        {/* `w-full`, not `w-screen`: 100vw includes the scrollbar gutter, so on
            any desktop browser with a classic scrollbar the wrapper was wider
            than the viewport — the exact horizontal overflow the now-removed
            body `overflow-x: hidden` was masking. Clipping moved to <html> in
            globals.css; see the note there. */}
        <div className="bg-bg text-fg h-auto w-full">
          <Navbar />

          <HeroSection />
          {/* </div> */}
          <div
            id="about"
            className="h-auto md:h-[140vh] relative mt-16 md:mt-[10rem] flex flex-col md:block pb-16 md:pb-0 gap-8 md:gap-0"
            ref={ref}
          >
            <Skiggle />
            <Header />
            <FeaturedVideo refForward={ref} />
            <SubHeader />
          </div>

          {/* The tools orbit that used to render here as <IntegrationsSection />
            now lives in the right column of the Achievements split inside
            Projects — see components/Achievements/Achievements.jsx. It keeps
            the #skills anchor, so nothing that linked to it is orphaned. */}
          <Projects />

          {/* <HorizontalScroll /> */}
          <Contact />
          <SiteFooter />

          {/* GradualBlur — hidden when footer is in view */}
          <div
            ref={blurRef}
            aria-hidden="true"
            style={{
              // Bounded to the blur's own 6rem strip rather than `inset: 0`.
              // A full-viewport fixed layer forced the compositor to process
              // the whole screen every scroll frame for a 96px-tall effect.
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              height: "6rem",
              pointerEvents: "none",
              zIndex: 99999,
            }}
          >
            <GradualBlur
              target="parent"
              position="bottom"
              height="6rem"
              strength={2}
              divCount={3}
              curve="bezier"
              exponential={false}
              opacity={0.9}
              zIndex={1}
            />
          </div>
          {/* <div className="bg-brblue flex items-center justify-center w-full h-screen font-extrabold text-9xl"> this is the footer  </div> */}
          {/* <div className="relative">
          <div className="absolute text-9xl font-bold text-center w-full h-full top-80">
            HIRE       ME
          </div>
          <Footer />
          <div className="absolute text-3xl font-bold text-center w-full h-full top-[40rem]">
            made by mtarif
          </div>
        </div> */}
        </div>
      </Suspense>
    </SmoothScroll>
  );
}
