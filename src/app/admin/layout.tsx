"use client";

import AuthProvider from "@/components/AuthProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-cream text-darkbrown font-sans antialiased">
        {children}
      </div>
    </AuthProvider>
  );
}
