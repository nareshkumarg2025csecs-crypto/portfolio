"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  // Only render the public navbar on non-admin routes
  if (pathname?.startsWith("/admin")) return null;
  return <Navbar />;
}
