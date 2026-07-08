"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

const navLinksData = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#skills", label: "Skills" },
  { href: "#projects", label: "Projects" },
  { href: "#certifications", label: "Certifications" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 1. Use Framer Motion's useScroll to avoid raw event listener lag
  const { scrollY } = useScroll();
  
  useMotionValueEvent(scrollY, "change", (latest) => {
    // This only triggers a re-render when the boolean value actually flips
    setScrolled(latest > 100);
  });

  // Memoize the links to prevent re-rendering the DOM structure on state changes
  const desktopLinks = useMemo(() => {
    return navLinksData.map((link) => (
      <motion.li 
        key={link.href} 
        layout="position"
        style={{ willChange: "transform" }}
      >
        <Link
          href={link.href}
          className="cursor-hover font-sans text-[13px] text-rust hover:opacity-60 transition-opacity duration-200 block whitespace-nowrap no-underline"
          style={{ textAlign: scrolled ? "right" : "center" }}
        >
          {link.label}
        </Link>
      </motion.li>
    ));
  }, [scrolled]);

  return (
    <>
      {/* ── Top-left: Wordmark ── */}
      <div
        style={{
          position: "absolute",
          top: "24px",
          left: "24px",
          zIndex: 50,
        }}
      >
        <Link href="#home" className="cursor-hover flex flex-col gap-0.5 hover:opacity-75 transition-opacity duration-300">
          <span
            style={{
              fontFamily: "var(--font-inter, sans-serif)",
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontSize: "13px",
              lineHeight: 1.2,
              color: "var(--color-rust, #B5490A)",
            }}
          >
            Naresh Kumar G
          </span>
          <span
            style={{
              fontFamily: "var(--font-inter, sans-serif)",
              fontSize: "9px",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              lineHeight: 1.3,
              color: "rgba(62,34,20,0.7)",
            }}
          >
            Full-Stack Developer / Cybersecurity
          </span>
        </Link>

        {/* Decorative ring + dot */}
        <div
          style={{
            marginTop: "14px",
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            border: "1px solid rgba(181,73,10,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "var(--color-rust, #B5490A)",
            }}
          />
        </div>
      </div>

      {/* ── Top-right (desktop): Nav links with scroll layout transition ── */}
      <motion.div
        className="hidden md:block"
        layout
        initial={false}
        style={{
          position: "fixed",
          right: "24px",
          zIndex: 50,
          willChange: "transform",
        }}
        animate={{
          top: scrolled ? "50%" : "24px",
          y: scrolled ? "-50%" : "0%",
        }}
        // 2. Reduce duration to 80ms and use a single transition object
        transition={{ duration: 0.08, ease: "easeOut" }}
      >
        <motion.ul
          layout="position"
          className={`flex list-none m-0 p-0 ${
            scrolled ? "flex-col items-end gap-5" : "flex-row items-center gap-10"
          }`}
          transition={{ duration: 0.08, ease: "easeOut" }}
          style={{ willChange: "transform" }}
        >
          {desktopLinks}
          <motion.li layout="position" style={{ willChange: "transform" }}>
            <Link
              href="/admin/login"
              className="cursor-hover font-sans text-[11px] text-rust/50 hover:text-rust transition-colors duration-200 block whitespace-nowrap no-underline"
              style={{ textAlign: scrolled ? "right" : "center" }}
            >
              Admin Access
            </Link>
          </motion.li>
        </motion.ul>
      </motion.div>

      {/* ── Mobile: hamburger toggle ── */}
      <button
        className="md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 60,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--color-rust, #B5490A)",
          padding: "4px",
        }}
      >
        {mobileOpen ? (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="7" x2="21" y2="7" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="17" x2="21" y2="17" />
          </svg>
        )}
      </button>

      {/* ── Mobile fullscreen overlay ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              backgroundColor: "#F3EEE1",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px",
            }}
          >
            {navLinksData.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
              >
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="cursor-hover"
                  style={{
                    fontFamily: "var(--font-inter, sans-serif)",
                    fontSize: "24px",
                    color: "var(--color-rust, #B5490A)",
                    textDecoration: "none",
                  }}
                >
                  {link.label}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: navLinksData.length * 0.06, duration: 0.35 }}
            >
              <Link
                href="/admin/login"
                onClick={() => setMobileOpen(false)}
                className="cursor-hover"
                style={{
                  fontFamily: "var(--font-inter, sans-serif)",
                  fontSize: "16px",
                  color: "var(--color-rust, #B5490A)",
                  opacity: 0.4,
                  textDecoration: "none",
                }}
              >
                Admin Access
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
