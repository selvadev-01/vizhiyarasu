import { a, useSpring } from "@react-spring/web";
import { Trail } from "./TrailText";
import React, { useEffect, useState } from "react";

const Header = () => {
  const [open, set] = useState();

  useEffect(() => {
    set(true);
  }, []);

  const [horizontal, api] = useSpring(() => ({ from: { transform: 'translateX(0%)' } }));

  const horizontalCallback = open => api.start({ transform: `translateX(${open ? '20%' : '0%'})` });
  // The display size is a clamp rather than a `md:text-[9rem]` step: the fixed
  // 144px jumped straight from 60px at exactly 768px, and "Testing Quality" set
  // at 144px is wider than a 768px viewport, so the tablet band overflowed
  // horizontally. The clamp scales continuously between the mobile floor and
  // the original 9rem desktop ceiling.
  return (
    <div className="w-full z-10 relative px-4 md:px-0 md:pl-6 font-semibold text-center md:text-left leading-[0.95] md:leading-none text-[clamp(2.75rem,9vw,9rem)]" style={{ letterSpacing: "-0.07em" }}>
      <Trail callback={horizontalCallback}>
        <a.div className="flex justify-center md:justify-start flex-wrap md:flex-nowrap" style={horizontal}>
          <div>Testing&nbsp;</div>
          <div>Quality&nbsp;</div>
        </a.div>
        <div className="flex justify-center md:justify-start flex-wrap md:flex-nowrap">
          <div>Into&nbsp;</div>
          <div>Software&nbsp;</div>
        </div>
      </Trail>
    </div>
  );
};

export default Header;
