import React, { useEffect } from "react";
import { useTrail, a, useSpring } from "@react-spring/web";
import { useInView } from "react-intersection-observer";

export const Trail = ({ children, callback, ...props }) => {
  const items = React.Children.toArray(children);
  const [ref, open] = useInView({ rootMargin: "-50px 0px" });
  const trail = useTrail(items.length, {
    config: { mass: 5, tension: 1000, friction: 200 },
    opacity: open ? 1 : 0,
    y: 20,
    // `1em` instead of a fixed 140px: the headline this wraps is now a clamp
    // that ranges from ~44px on a phone to 144px on desktop, so a pixel height
    // only matched the line box at the largest size and clipped or gapped
    // everywhere else. `em` inherits the resolved font size at every width.
    height: "1em",
    from: { opacity: 0, y: 20, height: "0em" },
    onRest: () => callback(open),
  });

  return (
    <div {...props} ref={ref}>
      {trail.map(({ height, ...style }, index) => (
        <a.div key={index} style={style}>
          <a.div style={{ height }}>{items[index]}</a.div>
        </a.div>
      ))}
    </div>
  );
};
