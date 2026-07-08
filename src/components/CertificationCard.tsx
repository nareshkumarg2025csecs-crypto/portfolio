"use client";

import { useState } from "react";
import { ExternalLink, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface CertificationCardProps {
  index: number;
  title: string;
  issuer: string;
  date: string;
  imageUrl?: string;
}

export default function CertificationCard({ index, title, issuer, date, imageUrl }: CertificationCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="cursor-hover group relative border border-darkbrown/20 bg-cream p-6 flex flex-col gap-4 shadow-md hover:shadow-xl hover:border-rust transition-all duration-500 cursor-pointer"
        onClick={() => imageUrl && setIsModalOpen(true)}
      >
        <div className="flex justify-between items-start relative z-10">
          <span className="font-mono text-[10px] uppercase tracking-widest text-rust">
            {date}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-darkbrown/40">
            {index.toString().padStart(2, "0")}
          </span>
        </div>

        <div className="relative z-10">
          <h3 className="font-serif text-xl sm:text-2xl text-darkbrown mb-2 tracking-tight group-hover:text-rust transition-colors duration-500">{title}</h3>
          <p className="font-sans text-darkbrown/70 text-sm">
            Issued by {issuer}
          </p>
        </div>

        {imageUrl && (
          <div className="mt-auto pt-4 relative z-20">
            <button 
              onClick={(e) => { e.stopPropagation(); setIsModalOpen(true); }} 
              className="cursor-hover inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-rust transition-colors"
            >
              <ExternalLink size={14} /> View Certificate
            </button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {isModalOpen && imageUrl && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-darkbrown/80 backdrop-blur-sm p-4 sm:p-8"
            onClick={() => setIsModalOpen(false)}
          >
            <div className="relative w-full max-w-4xl max-h-full flex flex-col" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute -top-12 right-0 text-cream hover:text-rust transition-colors"
              >
                <X size={32} />
              </button>
              <div className="relative w-full h-[80vh]">
                <Image 
                  src={imageUrl.startsWith('http') ? imageUrl : `/images/${imageUrl}`}
                  alt={title} 
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
