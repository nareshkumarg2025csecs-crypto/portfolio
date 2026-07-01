"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const navLinks = [
  { href: "#about", label: "01 About" },
  { href: "#skills", label: "02 Skills" },
  { href: "#projects", label: "03 Projects" },
  { href: "#certifications", label: "04 Certifications" },
  { href: "#contact", label: "05 Contact" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 right-0 z-50 p-6 flex flex-col items-end gap-2 text-xs uppercase tracking-widest font-mono mix-blend-difference transition-all duration-300 ${isScrolled ? "text-rust" : "text-darkbrown"}`}>
      {navLinks.map((link) => (
        <Link 
          key={link.href} 
          href={link.href}
          className="hover:text-rust transition-colors duration-300"
        >
          {link.label}
        </Link>
      ))}
      <Link 
        href="/admin/login"
        className="mt-4 opacity-50 hover:opacity-100 hover:text-rust transition-colors duration-300"
      >
        Admin Access
      </Link>
    </nav>
  );
}
