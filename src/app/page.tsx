import Image from "next/image";
import Link from "next/link";
import Ticker from "@/components/Ticker";
import ClockWidget from "@/components/ClockWidget";
import ProjectCard from "@/components/ProjectCard";
import CertificationCard from "@/components/CertificationCard";
import ContactForm from "@/components/ContactForm";
import SplitText from "@/components/SplitText";

import { collection, getDocs, query, orderBy, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const revalidate = 0; // Disable cache so data is always fresh

async function getPortfolioData() {
  try {
    const profileSnap = await getDoc(doc(db, "profile", "main"));
    const profile = profileSnap.exists() ? profileSnap.data() : null;

    const skillsSnap = await getDocs(collection(db, "skills"));
    const skillsData = skillsSnap.docs.map(d => d.data());
    const skills: Record<string, string[]> = {};
    skillsData.forEach(s => {
      if (!skills[s.category]) skills[s.category] = [];
      skills[s.category].push(s.name);
    });

    const projectsSnap = await getDocs(query(collection(db, "projects"), orderBy("order", "asc")));
    const projects = projectsSnap.docs.map(d => d.data());

    const certsSnap = await getDocs(collection(db, "certifications"));
    const certifications = certsSnap.docs.map(d => d.data())
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return { profile, skills, projects, certifications };
  } catch (error) {
    console.error("Error fetching portfolio data:", error);
    return { profile: null, skills: {}, projects: [], certifications: [] };
  }
}

export default async function Home() {
  const { profile, skills, projects, certifications } = await getPortfolioData();
  return (
    <main className="relative w-full min-h-screen text-darkbrown selection:bg-rust selection:text-cream">
      {/* Background Texture with Overlay */}
      <div className="fixed inset-0 z-[-2] bg-[url('/textures/bg-texture.jpg')] bg-repeat" style={{ backgroundSize: '300px' }}></div>
      <div className="fixed inset-0 z-[-1] bg-[#F3EEE1]/85"></div>
      
      {/* Home / Hero Section */}
      <section id="home" className="relative w-full h-screen flex flex-col justify-between pt-24 pb-12 px-6 sm:px-12 md:px-24 snap-start">
        <div className="absolute top-24 left-6 sm:left-12 md:left-24 z-10 animate-fade-in-up" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
          <ClockWidget />
        </div>
        
        <div className="w-full mt-32 flex flex-col items-center justify-center flex-grow text-center">
          <div className="animate-fade-in-up" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
            <SplitText
              text={profile?.name || "Naresh Kumar G"}
              className="font-display text-5xl sm:text-7xl md:text-9xl tracking-tighter uppercase text-rust leading-none"
              delay={40}
              duration={1}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.1}
              rootMargin="-100px"
              textAlign="center"
              tag="h1"
            />
            <p className="mt-6 font-serif italic text-2xl sm:text-3xl md:text-4xl text-darkbrown/80 max-w-3xl mx-auto">
              {profile?.title || "Full-Stack Developer & Cybersecurity Enthusiast"}
            </p>
          </div>
          
          <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
            <Link href="#projects" className="group flex flex-col items-center gap-4">
              <span className="font-mono text-xs uppercase tracking-widest text-darkbrown/60 group-hover:text-rust transition-colors">
                View my work
              </span>
              <div className="w-[1px] h-16 bg-darkbrown/20 group-hover:bg-rust transition-colors overflow-hidden">
                <div className="w-full h-full bg-rust transform -translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </div>
            </Link>
          </div>
        </div>
        
        <div className="absolute bottom-12 left-0 w-full animate-fade-in-up" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
          <Ticker />
        </div>

        <div className="absolute bottom-12 right-6 md:right-12 z-20 animate-bounce">
          <span 
            className="font-sans text-[10px] uppercase tracking-widest text-rust"
            style={{ writingMode: 'vertical-rl' }}
          >
            Scroll to explore
          </span>
        </div>
      </section>

      {/* 01 About Section */}
      <section id="about" className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 snap-start border-t border-dotted border-rust flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-rust">01</span>
          <h2 className="font-serif italic text-6xl sm:text-7xl md:text-8xl text-rust tracking-tighter uppercase">About</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 flex-grow items-center">
          <div className="md:col-span-5 md:col-start-2">
            <div className="aspect-[3/4] relative w-full overflow-hidden bg-darkbrown/5 filter grayscale hover:grayscale-0 transition-all duration-700">
              <Image 
                src={profile?.photoUrl || "/images/profile.png"} 
                alt={profile?.name || "Profile"} 
                fill 
                className="object-cover"
                style={{ objectPosition: "80% 30%" }}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
          <div className="md:col-span-5 flex flex-col gap-8">
            <h3 className="font-serif text-3xl md:text-4xl text-darkbrown leading-tight">
              {profile?.bio || "I build secure, scalable applications and explore the intersection of web development and cybersecurity."}
            </h3>
            <p className="font-sans text-darkbrown/80 leading-relaxed text-lg">
              Currently pursuing a B.E. in CSE (Cybersecurity) alongside an Honours Diploma in Full Stack Development at CSC. I&apos;m passionate about creating seamless digital experiences backed by robust, secure architectures.
            </p>
            
            <div className="pt-8 border-t border-darkbrown/10 mt-4 flex flex-col gap-6">
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-darkbrown/50 mb-2">Education</h4>
                <p className="font-sans text-darkbrown">Rajalakshmi Engineering College</p>
                <p className="font-sans text-darkbrown/70 text-sm">B.E. CSE Cybersecurity</p>
              </div>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-widest text-darkbrown/50 mb-2">Location</h4>
                <p className="font-sans text-darkbrown">Chennai, India</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 02 Skills Section */}
      <section id="skills" className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 snap-start border-t border-dotted border-rust flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full mb-24">
          <span className="font-mono text-xs uppercase tracking-widest text-rust">02</span>
          <h2 className="font-serif italic text-6xl sm:text-7xl md:text-8xl text-rust tracking-tighter uppercase">Skills</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 max-w-7xl mx-auto w-full">
          {Object.entries(skills).map(([category, items]) => (
            <div key={category} className="flex flex-col gap-6 group">
              <h3 className="font-mono text-sm uppercase tracking-widest text-rust pb-4 border-b border-darkbrown/10 group-hover:border-rust transition-colors duration-500">
                {category}
              </h3>
              <ul className="flex flex-col gap-4">
                {items.map((skill) => (
                  <li key={skill} className="font-sans text-lg text-darkbrown/80 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-rust/40 rounded-full"></span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* 03 Projects Section */}
      <section id="projects" className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 snap-start border-t border-dotted border-rust flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-rust">03</span>
          <h2 className="font-serif italic text-6xl sm:text-7xl md:text-8xl text-rust tracking-tighter uppercase">Projects</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full">
          {projects.map((project, idx) => (
            <ProjectCard 
              key={project.title}
              index={idx + 1}
              title={project.title}
              description={project.description}
              tags={project.tags}
              githubUrl={project.githubUrl}
              featured={idx < 2}
            />
          ))}
        </div>
      </section>

      {/* 04 Certifications Section */}
      <section id="certifications" className="relative w-full min-h-screen py-24 px-6 sm:px-12 md:px-24 snap-start border-t border-dotted border-rust flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-rust">04</span>
          <h2 className="font-serif italic text-6xl sm:text-7xl md:text-8xl text-rust tracking-tighter uppercase">Certifications</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full">
          {certifications.map((cert, idx) => (
            <CertificationCard 
              key={cert.title}
              index={idx + 1}
              title={cert.title}
              issuer={cert.issuer}
              date={cert.date}
              imageUrl={cert.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* 05 Contact Section */}
      <section id="contact" className="relative w-full min-h-[80vh] py-24 px-6 sm:px-12 md:px-24 snap-start border-t-2 border-dotted border-rust flex flex-col">
        <div className="flex flex-col md:flex-row gap-4 md:gap-12 w-full mb-16">
          <span className="font-mono text-xs uppercase tracking-widest text-rust">05</span>
          <h2 className="font-serif italic text-6xl sm:text-7xl md:text-8xl text-rust tracking-tighter uppercase">Contact</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-7xl mx-auto w-full flex-grow">
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-4xl sm:text-5xl text-darkbrown leading-tight mb-8">
                Let&apos;s build something exceptional together.
              </h3>
              
              <div className="flex flex-col gap-6 mt-12">
                <a href="mailto:nareshkumar.g.2025.csecs@rajalakshmi.edu.in" className="flex items-center gap-3 font-sans text-xl text-darkbrown hover:text-rust transition-colors w-max">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z"/>
                  </svg>
                  Email Me ↗
                </a>
                <a href="https://github.com/nareshkumarg2025csecs-crypto/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-sans text-xl text-darkbrown hover:text-rust transition-colors w-max">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  GitHub ↗
                </a>
                <a href="https://www.linkedin.com/in/naresh-kumar-g-31264939a?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 font-sans text-xl text-darkbrown hover:text-rust transition-colors w-max">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn ↗
                </a>
              </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-darkbrown/10">
              <a href={profile?.resumeUrl || "/resume.pdf"} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-4 bg-rust text-cream font-mono text-xs uppercase tracking-widest px-8 py-4 hover:bg-darkbrown transition-colors duration-300">
                Download Resume
              </a>
            </div>
          </div>
          
          <div className="bg-cream border border-darkbrown/10 p-8 sm:p-12 h-max">
            <h3 className="font-mono text-sm uppercase tracking-widest text-darkbrown/60 mb-8">Send a message</h3>
            <ContactForm />
          </div>
        </div>
        
        <div className="w-full pt-16 mt-24 border-t border-dotted border-rust flex flex-col md:flex-row justify-between items-end gap-6">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="font-serif italic text-4xl text-rust">Thank you.</p>
          </div>
          <div className="flex flex-col gap-2 text-center md:text-right">
            <p className="font-mono text-xs text-darkbrown/70">
              Phone: {profile?.phone || "9840264843"}
            </p>
            <p className="font-mono text-xs text-darkbrown/70">
              Email: {profile?.email || "nareshkumar.g.2025.csecs@rajalakshmi.edu.in"}
            </p>
            <p className="font-mono text-xs uppercase tracking-widest text-darkbrown/50">
              © {new Date().getFullYear()} Nareshkumar G
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
