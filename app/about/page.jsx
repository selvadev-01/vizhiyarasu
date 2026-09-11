"use client";

import Navbar from "@/components/Navbar/Navbar";
import React from "react";
import dynamic from "next/dynamic";

// Same reasoning as the hero's LiquidEther: this r3f particle field is
// decorative, WebGL-only, and rendered nothing on the server, so keeping
// three/fiber out of the initial chunk costs nothing visually.
const Scene = dynamic(() => import("@/components/About/Particles/Particles"), {
  ssr: false,
});

const About = () => {
  // `w-full` not `w-screen`: 100vw includes the scrollbar gutter, so the page
  // was wider than the body and relied on an ancestor's overflow-x clip.
  // `min-h-[100svh]` replaces `h-screen` so the layout cannot be clipped
  // shorter than its content on mobile, where 100vh assumes a hidden URL bar.
  return (
    <div className="w-full min-h-[100svh] bg-black text-white overflow-hidden relative">
     <Navbar />
      <Scene/>
      <ScrollText />
      {/* A clamp replaces the text-7xl -> lg:text-[17rem] cliff, which left the
          768-1023px band at 72px in a layout composed for 272px. Capped at 17rem
          so the desktop appearance is unchanged, and `max-w-full` keeps the
          tracked-out wordmark from overflowing narrow viewports. */}
      <div className="absolute text-[clamp(3.5rem,19vw,17rem)] font-extrabold tracking-widest bottom-0 right-1/2 translate-x-1/2 w-auto max-w-full leading-none">SMATIK</div>
    </div>
  );
};

export default About;

const ScrollText = (props) => {
  return (
    <div className="w-full flex items-center justify-between font-bold text-base sm:text-xl lg:text-3xl text-white absolute top-2/3 lg:top-1/2 px-4 sm:px-8 lg:px-20" {...props}>
      <div>+</div>
      <div>+</div>
      <div>Scroll to Explore</div>
      <div>+</div>
      <div>+</div>
    </div>
  );
};
