"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      router.push("/admin/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin/dashboard");
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-cream">
      <form onSubmit={handleLogin} className="w-full max-w-md bg-white/50 border border-darkbrown/10 p-8 flex flex-col gap-6 shadow-sm">
        <h1 className="font-serif text-3xl text-rust mb-2">Admin Login</h1>
        
        {error && <div className="text-sm font-mono text-rust bg-rust/10 p-3">{error}</div>}
        
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-widest text-darkbrown/60">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-transparent border-b border-darkbrown/20 py-2 font-sans focus:outline-none focus:border-rust"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="font-mono text-xs uppercase tracking-widest text-darkbrown/60">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="bg-transparent border-b border-darkbrown/20 py-2 font-sans focus:outline-none focus:border-rust"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          className="mt-4 bg-rust text-cream font-mono text-xs uppercase tracking-widest py-3 hover:bg-darkbrown transition-colors disabled:opacity-50"
        >
          {loading ? "Authenticating..." : "Login"}
        </button>
      </form>
    </div>
  );
}
