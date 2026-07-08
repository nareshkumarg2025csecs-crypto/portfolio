"use client";

import { ExternalLink, Code2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface ProjectCardProps {
  id: string;
  index: number;
  title: string;
  description: string;
  tags: string[];
  githubUrl?: string;
  liveUrl?: string;
  showcaseImages?: string[];
  featured?: boolean;
}

export default function ProjectCard({ id, index, title, description, tags, githubUrl, liveUrl, showcaseImages, featured }: ProjectCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="cursor-hover group relative border border-darkbrown/20 bg-cream p-6 sm:p-8 flex flex-col gap-6 shadow-md hover:shadow-xl hover:border-rust transition-all duration-500"
    >
      <div className="flex justify-between items-start">
        <span className="font-mono text-xs uppercase tracking-widest text-darkbrown/60">
          {index.toString().padStart(2, "0")}
        </span>
        {featured && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-rust bg-rust/10 px-2 py-1 rounded-sm">
            Featured
          </span>
        )}
      </div>

      <div className="flex-grow">
        <h3 className="font-serif text-3xl sm:text-4xl text-darkbrown mb-4 tracking-tight group-hover:text-rust transition-colors duration-500">{title}</h3>
        <p className="font-sans text-darkbrown/80 text-sm leading-relaxed mb-6">
          {description}
        </p>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="font-mono text-[11px] uppercase tracking-wider text-darkbrown/70 bg-darkbrown/5 px-2 py-1">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 pt-4 border-t border-darkbrown/10 mt-auto relative z-10">
        {showcaseImages && showcaseImages.length > 0 && (
          <Link href={`/projects/${id}/showcase`} className="cursor-hover flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-rust transition-colors">
            <ImageIcon size={14} /> Showcase
          </Link>
        )}
        {githubUrl && (
          <Link href={githubUrl} target="_blank" rel="noopener noreferrer" className="cursor-hover flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-rust transition-colors">
            <Code2 size={14} /> Source
          </Link>
        )}
        {liveUrl && (
          <Link href={liveUrl} target="_blank" rel="noopener noreferrer" className="cursor-hover flex items-center gap-2 font-mono text-xs uppercase tracking-widest hover:text-rust transition-colors">
            <ExternalLink size={14} /> Visit
          </Link>
        )}
      </div>
    </motion.div>
  );
}
