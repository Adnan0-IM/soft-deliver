import { useEffect, useState } from "react";

export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mqWidth = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const mqCoarse = window.matchMedia("(hover: none) and (pointer: coarse)");
    const update = () => setIsMobile(mqWidth.matches || mqCoarse.matches);
    update();
    mqWidth.addEventListener("change", update);
    mqCoarse.addEventListener("change", update);
    return () => {
      mqWidth.removeEventListener("change", update);
      mqCoarse.removeEventListener("change", update);
    };
  }, [breakpoint]);

  return isMobile;
}
