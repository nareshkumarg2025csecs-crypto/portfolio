"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, animate } from "framer-motion";
import { usePathname } from "next/navigation";

const BRACKET = 22;  
const PAD     = 10;  
const RHALF   = 11;  


const RUST = "#C1502E";

const SHADOW = "drop-shadow(0 0 3px rgba(193, 80, 46, 0.45))";

export default function CustomCursor() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdmin) {
      document.body.classList.add("admin-override");
    } else {
      document.body.classList.remove("admin-override");
    }
  }, [isAdmin]);

  
  const dotX = useMotionValue(-200);
  const dotY = useMotionValue(-200);

  
  const ringXRaw = useMotionValue(-200);
  const ringYRaw = useMotionValue(-200);
  const ringX = useSpring(ringXRaw, { stiffness: 100, damping: 20 });
  const ringY = useSpring(ringYRaw, { stiffness: 100, damping: 20 });

  
  const tlX = useMotionValue(-RHALF);
  const tlY = useMotionValue(-RHALF);
  const trX = useMotionValue(RHALF - BRACKET);
  const trY = useMotionValue(-RHALF);
  const blX = useMotionValue(-RHALF);
  const blY = useMotionValue(RHALF - BRACKET);
  const brX = useMotionValue(RHALF - BRACKET);
  const brY = useMotionValue(RHALF - BRACKET);

  
  const bwTL = useMotionValue(1);
  const bwTR = useMotionValue(1);
  const bwBL = useMotionValue(1);
  const bwBR = useMotionValue(1);

  
  const opTL = useMotionValue(1);
  const opTR = useMotionValue(1);
  const opBL = useMotionValue(1);
  const opBR = useMotionValue(1);

  
  const radTL = useMotionValue(RHALF);
  const radTR = useMotionValue(RHALF);
  const radBL = useMotionValue(RHALF);
  const radBR = useMotionValue(RHALF);

  
  const scTL = useMotionValue(1);
  const scTR = useMotionValue(1);
  const scBL = useMotionValue(1);
  const scBR = useMotionValue(1);

  
  const currentTarget  = useRef<Element | null>(null);
  const resizeObserver = useRef<ResizeObserver | null>(null);
  const isHovering     = useRef(false);

  
  const lockSpring   = { type: "spring" as const, stiffness: 300, damping: 25 };
  const unlockSpring = { type: "spring" as const, stiffness: 100, damping: 20 };

  
  const pulseBrackets = useCallback(() => {
    const pulse = { type: "spring" as const, stiffness: 600, damping: 18 };
    [scTL, scTR, scBL, scBR].forEach(mv => {
      mv.set(1.15);
      animate(mv, 1, pulse);
    });
  
  }, []);

  
  const lockBrackets = useCallback((rect: DOMRect) => {
    
    const targetW = Math.max(rect.width, 40);
    const targetH = Math.max(rect.height, 40);
    const hw = targetW  / 2 + PAD;
    const hh = targetH / 2 + PAD;

    animate(tlX, -hw,           lockSpring);
    animate(tlY, -hh,           lockSpring);
    animate(trX, hw - BRACKET,  lockSpring);
    animate(trY, -hh,           lockSpring);
    animate(blX, -hw,           lockSpring);
    animate(blY, hh - BRACKET,  lockSpring);
    animate(brX, hw - BRACKET,  lockSpring);
    animate(brY, hh - BRACKET,  lockSpring);

    [bwTL, bwTR, bwBL, bwBR].forEach(mv => animate(mv, 3,     lockSpring));
    [opTL, opTR, opBL, opBR].forEach(mv => animate(mv, 0.5,   lockSpring));
    [radTL, radTR, radBL, radBR].forEach(mv => animate(mv, 0,  lockSpring));
  
  }, []);

  
  const unlockBrackets = useCallback(() => {
    animate(tlX, -RHALF,          unlockSpring);
    animate(tlY, -RHALF,          unlockSpring);
    animate(trX, RHALF - BRACKET, unlockSpring);
    animate(trY, -RHALF,          unlockSpring);
    animate(blX, -RHALF,          unlockSpring);
    animate(blY, RHALF - BRACKET, unlockSpring);
    animate(brX, RHALF - BRACKET, unlockSpring);
    animate(brY, RHALF - BRACKET, unlockSpring);

    [bwTL, bwTR, bwBL, bwBR].forEach(mv => animate(mv, 1,     unlockSpring));
    [opTL, opTR, opBL, opBR].forEach(mv => animate(mv, 1,     unlockSpring));
    [radTL, radTR, radBL, radBR].forEach(mv => animate(mv, RHALF, unlockSpring));
    [scTL, scTR, scBL, scBR].forEach(mv => animate(mv, 1,    unlockSpring));
  
  }, []);

  
  const recalcRect = useCallback(() => {
    if (currentTarget.current && isHovering.current) {
      const rect = currentTarget.current.getBoundingClientRect();
      ringXRaw.set(rect.left + rect.width  / 2);
      ringYRaw.set(rect.top  + rect.height / 2);
      lockBrackets(rect);
    }
  
  }, [lockBrackets]);

  
  const cleanupObserver = useCallback(() => {
    if (resizeObserver.current) {
      resizeObserver.current.disconnect();
      resizeObserver.current = null;
    }
  }, []);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const onMove = (e: MouseEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      if (!isHovering.current) {
        ringXRaw.set(e.clientX);
        ringYRaw.set(e.clientY);
      }
    };

    const onOver = (e: MouseEvent) => {
      const hoverEl = (e.target as HTMLElement).closest<HTMLElement>(".cursor-hover");
      if (!hoverEl) return;
      if (hoverEl === currentTarget.current) return;

      currentTarget.current = hoverEl;
      isHovering.current = true;

      const rect = hoverEl.getBoundingClientRect();
      ringXRaw.set(rect.left + rect.width  / 2);
      ringYRaw.set(rect.top  + rect.height / 2);
      lockBrackets(rect);
      pulseBrackets(); 

      cleanupObserver();
      resizeObserver.current = new ResizeObserver(recalcRect);
      resizeObserver.current.observe(hoverEl);
    };

    const onOut = (e: MouseEvent) => {
      if (!currentTarget.current) return;
      const related = e.relatedTarget as HTMLElement | null;
      if (related && currentTarget.current.contains(related)) return;
      if (related?.closest(".cursor-hover")) return;

      isHovering.current  = false;
      currentTarget.current = null;
      cleanupObserver();
      unlockBrackets();
    };

    const onScroll = () => recalcRect();
    const onResize = () => recalcRect();

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout",  onOut);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout",  onOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cleanupObserver();
    };
  }, [dotX, dotY, ringXRaw, ringYRaw, lockBrackets, unlockBrackets, pulseBrackets, recalcRect, cleanupObserver]);

  if (isAdmin) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9999]"
      aria-hidden="true"
      style={{ mixBlendMode: "difference" }}
    >
      
      <motion.div
        className="fixed top-0 left-0"
        style={{ x: ringX, y: ringY }}
      >
        
        <motion.div
          className="absolute"
          style={{
            x: tlX, y: tlY,
            scale: scTL,
            width: BRACKET, height: BRACKET,
            borderTopStyle:    "solid",
            borderLeftStyle:   "solid",
            borderRightStyle:  "none",
            borderBottomStyle: "none",
            borderColor: RUST,
            borderWidth: bwTL,
            opacity: opTL,
            borderTopLeftRadius:     radTL,
            borderTopRightRadius:    0,
            borderBottomLeftRadius:  0,
            borderBottomRightRadius: 0,
            filter: SHADOW,
          }}
        />
        
        <motion.div
          className="absolute"
          style={{
            x: trX, y: trY,
            scale: scTR,
            width: BRACKET, height: BRACKET,
            borderTopStyle:    "solid",
            borderRightStyle:  "solid",
            borderLeftStyle:   "none",
            borderBottomStyle: "none",
            borderColor: RUST,
            borderWidth: bwTR,
            opacity: opTR,
            borderTopRightRadius:    radTR,
            borderTopLeftRadius:     0,
            borderBottomLeftRadius:  0,
            borderBottomRightRadius: 0,
            filter: SHADOW,
          }}
        />
        
        <motion.div
          className="absolute"
          style={{
            x: blX, y: blY,
            scale: scBL,
            width: BRACKET, height: BRACKET,
            borderBottomStyle: "solid",
            borderLeftStyle:   "solid",
            borderTopStyle:    "none",
            borderRightStyle:  "none",
            borderColor: RUST,
            borderWidth: bwBL,
            opacity: opBL,
            borderBottomLeftRadius:  radBL,
            borderTopLeftRadius:     0,
            borderTopRightRadius:    0,
            borderBottomRightRadius: 0,
            filter: SHADOW,
          }}
        />
        
        <motion.div
          className="absolute"
          style={{
            x: brX, y: brY,
            scale: scBR,
            width: BRACKET, height: BRACKET,
            borderBottomStyle: "solid",
            borderRightStyle:  "solid",
            borderTopStyle:    "none",
            borderLeftStyle:   "none",
            borderColor: RUST,
            borderWidth: bwBR,
            opacity: opBR,
            borderBottomRightRadius: radBR,
            borderTopLeftRadius:     0,
            borderTopRightRadius:    0,
            borderBottomLeftRadius:  0,
            filter: SHADOW,
          }}
        />
      </motion.div>

      
      
      <motion.div
        className="fixed top-0 left-0 rounded-full"
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
          width: 6,
          height: 6,
          backgroundColor: RUST,
        }}
      />
    </div>
  );
}
