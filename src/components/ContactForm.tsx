"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      message: formData.get("message"),
      createdAt: serverTimestamp(),
      read: false,
    };

    try {
      await addDoc(collection(db, "messages"), data);
      setStatus("success");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error submitting message:", error);
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full max-w-xl">
      <div className="flex flex-col gap-2">
        <label htmlFor="name" className="font-mono text-[11px] uppercase tracking-widest text-darkbrown/60">Name</label>
        <input 
          type="text" 
          id="name" 
          name="name" 
          required
          className="bg-transparent border-b border-darkbrown/20 py-3 font-sans text-darkbrown focus:outline-none focus:border-rust transition-colors rounded-none"
          placeholder="John Doe"
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="font-mono text-[11px] uppercase tracking-widest text-darkbrown/60">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required
          className="bg-transparent border-b border-darkbrown/20 py-3 font-sans text-darkbrown focus:outline-none focus:border-rust transition-colors rounded-none"
          placeholder="john@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="message" className="font-mono text-[11px] uppercase tracking-widest text-darkbrown/60">Message</label>
        <textarea 
          id="message" 
          name="message" 
          required
          rows={4}
          className="bg-transparent border-b border-darkbrown/20 py-3 font-sans text-darkbrown focus:outline-none focus:border-rust transition-colors resize-none rounded-none"
          placeholder="Hello..."
        ></textarea>
      </div>

      <button 
        type="submit" 
        disabled={status === "submitting"}
        className="self-start mt-4 border border-rust text-rust font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-rust hover:text-cream transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? "Sending..." : status === "success" ? "Message Sent" : "Send Message"}
      </button>
      
      {status === "error" && (
        <span className="font-mono text-xs text-rust">Error sending message. Please try again.</span>
      )}
    </form>
  );
}
