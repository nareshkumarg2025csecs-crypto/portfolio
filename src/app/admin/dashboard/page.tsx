"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { auth, db } from "@/lib/firebase";
import { supabase } from "@/lib/supabase";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, addDoc, setDoc, Timestamp } from "firebase/firestore";
import Link from "next/link";

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl?: string;
}

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: Timestamp;
  read: boolean;
}

interface Profile {
  name: string;
  title: string;
  bio: string;
  location: string;
  email: string;
  phone: string;
  githubUrl: string;
  linkedinUrl: string;
  photoUrl?: string;
  resumeUrl?: string;
}

interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  githubUrl: string;
  liveUrl: string;
  imageUrl?: string;
  showcaseImages?: string[];
  featured: boolean;
  order: number;
}

const classes = {
  card: "bg-white/80 border border-[rgba(58,46,38,0.08)] rounded-[14px] shadow-[0_1px_3px_rgba(58,46,38,0.06),0_1px_2px_rgba(58,46,38,0.04)] hover:shadow-[0_4px_12px_rgba(58,46,38,0.08)] hover:-translate-y-[1px] transition-all duration-150 ease-out",
  buttonPrimary: "bg-rust text-cream font-mono text-xs uppercase tracking-widest px-6 py-3 rounded-[10px] hover:bg-[#9d3f09] hover:-translate-y-[1px] transition-all duration-150 ease-out disabled:opacity-50",
  buttonSecondary: "font-mono text-xs uppercase tracking-widest rounded-lg px-2.5 py-1 bg-darkbrown/5 text-rust hover:bg-darkbrown/10 transition-colors duration-150",
  buttonDelete: "font-mono text-xs uppercase tracking-widest rounded-lg px-2.5 py-1 bg-[#8c2a2a]/10 text-[#8c2a2a] hover:bg-[#8c2a2a]/20 transition-colors duration-150",
  input: "w-full border border-[rgba(58,46,38,0.15)] rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(181,80,45,0.1)] transition-all duration-150",
  badge: "font-mono text-[10px] uppercase tracking-widest text-rust bg-rust/10 px-2 py-0.5 rounded-md",
  sidebarLinkActive: "text-left font-mono text-xs uppercase tracking-widest p-3 mx-2 rounded-[10px] bg-rust text-cream transition-all duration-150",
  sidebarLinkInactive: "text-left font-mono text-xs uppercase tracking-widest p-3 mx-2 rounded-[10px] text-darkbrown/70 hover:bg-[#EAE4D3] transition-all duration-150",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingCertification, setEditingCertification] = useState<Certification | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    
    // Subscribe to messages
    const qMsgs = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubMsgs = onSnapshot(qMsgs, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message));
      setMessages(msgs);
    });

    // Subscribe to certifications
    const unsubCerts = onSnapshot(collection(db, "certifications"), (snapshot) => {
      const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certification));
      setCertifications(certs);
    });

    // Subscribe to profile
    const unsubProfile = onSnapshot(doc(db, "profile", "main"), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as Profile);
      }
    });

    // Subscribe to skills
    const unsubSkills = onSnapshot(collection(db, "skills"), (snapshot) => {
      const s = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill));
      setSkills(s);
    });

    // Subscribe to projects
    const qProjects = query(collection(db, "projects"), orderBy("order", "asc"));
    const unsubProjects = onSnapshot(qProjects, (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(p);
    });
    
    return () => {
      unsubMsgs();
      unsubCerts();
      unsubProfile();
      unsubSkills();
      unsubProjects();
    };
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const markAsRead = async (id: string, currentStatus: boolean) => {
    await updateDoc(doc(db, "messages", id), { read: !currentStatus });
  };

  const deleteMessage = async (id: string) => {
    if (confirm("Are you sure?")) {
      await deleteDoc(doc(db, "messages", id));
    }
  };

  const handleRemoveProfilePhoto = async () => {
    if (!profile?.photoUrl) return;
    if (confirm("Remove profile photo?")) {
      await setDoc(doc(db, "profile", "main"), { photoUrl: "" }, { merge: true });
    }
  };

  const handleRemoveResume = async () => {
    if (!profile?.resumeUrl) return;
    if (confirm("Remove resume?")) {
      await setDoc(doc(db, "profile", "main"), { resumeUrl: "" }, { merge: true });
    }
  };

  const handleRemoveProjectImage = async () => {
    if (!editingProject?.imageUrl) return;
    if (confirm("Remove project image?")) {
      await updateDoc(doc(db, "projects", editingProject.id), { imageUrl: "" });
      setEditingProject({ ...editingProject, imageUrl: "" });
    }
  };

  const handleRemoveShowcaseImage = async (urlToRemove: string) => {
    if (!editingProject?.showcaseImages) return;
    if (confirm("Remove this showcase image?")) {
      const newImages = editingProject.showcaseImages.filter(url => url !== urlToRemove);
      
      try {
        const urlParts = urlToRemove.split('/portfolio-assets/');
        if (urlParts.length === 2) {
          // Decode URI component in case the stored URL had encoding
          const filePath = decodeURIComponent(urlParts[1]);
          const { error } = await supabase.storage.from('portfolio-assets').remove([filePath]);
          if (error) console.error("Error deleting file from Supabase:", error);
        }
      } catch (error) {
        console.error("Failed to delete from Supabase:", error);
      }

      await updateDoc(doc(db, "projects", editingProject.id), { showcaseImages: newImages });
      setEditingProject({ ...editingProject, showcaseImages: newImages });
    }
  };

  const handleRemoveCertificationImage = async () => {
    if (!editingCertification?.imageUrl) return;
    if (confirm("Remove certification image?")) {
      await updateDoc(doc(db, "certifications", editingCertification.id), { imageUrl: "" });
      setEditingCertification({ ...editingCertification, imageUrl: "" });
    }
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const formData = new FormData(e.currentTarget);
    const photoFile = formData.get("photo") as File;
    const resumeFile = formData.get("resume") as File;
    
    let photoUrl = profile?.photoUrl || "";
    let resumeUrl = profile?.resumeUrl || "";

    try {
      if (photoFile && photoFile.size > 0) {
        const filePath = `profile/${Date.now()}_${photoFile.name}`;
        const { error } = await supabase.storage.from('portfolio-assets').upload(filePath, photoFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        photoUrl = publicUrl;
      }

      if (resumeFile && resumeFile.size > 0) {
        const filePath = `resume/${Date.now()}_${resumeFile.name}`;
        const { error } = await supabase.storage.from('portfolio-assets').upload(filePath, resumeFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        resumeUrl = publicUrl;
      }

      const updatedProfile = {
        name: formData.get("name"),
        title: formData.get("title"),
        bio: formData.get("bio"),
        location: formData.get("location"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        githubUrl: formData.get("githubUrl"),
        linkedinUrl: formData.get("linkedinUrl"),
        photoUrl,
        resumeUrl
      };

      await setDoc(doc(db, "profile", "main"), updatedProfile, { merge: true });
      alert("Profile saved successfully!");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert("Failed to save profile.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSkillSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const skillData = {
      name: formData.get("name"),
      category: formData.get("category"),
      proficiency: Number(formData.get("proficiency"))
    };

    try {
      console.log("Auth current user before skill save:", auth.currentUser);
      if (editingSkill) {
        await updateDoc(doc(db, "skills", editingSkill.id), skillData);
        setEditingSkill(null);
      } else {
        await addDoc(collection(db, "skills"), skillData);
      }
      (e.target as HTMLFormElement).reset();
      alert("Skill saved!");
    } catch (err) {
      console.error("Error saving skill:", err);
      alert("Failed to save skill.");
    }
  };

  const handleProjectSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;
    let imageUrl = editingProject?.imageUrl || "";

    const showcaseFiles = formData.getAll("showcaseImages") as File[];
    let currentShowcaseImages = editingProject?.showcaseImages ? [...editingProject.showcaseImages] : [];

    try {
      console.log("Auth current user before project save:", auth.currentUser);
      if (file && file.size > 0) {
        const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const filePath = `projects/${Date.now()}_${sanitizedFileName}`;
        const { error } = await supabase.storage.from('portfolio-assets').upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      for (const sf of showcaseFiles) {
        if (sf && sf.size > 0) {
          if (!["image/jpeg", "image/png", "image/webp"].includes(sf.type)) {
            alert(`File ${sf.name} is not a valid image. Only JPG, PNG, WEBP are allowed.`);
            continue;
          }
          const sanitizedFileName = sf.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const filePath = `projects/${Date.now()}_showcase_${sanitizedFileName}`;
          const { error } = await supabase.storage.from('portfolio-assets').upload(filePath, sf);
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
          currentShowcaseImages.push(publicUrl);
        }
      }

      const tagsString = formData.get("tags") as string;
      const tags = tagsString.split(",").map(t => t.trim()).filter(t => t);

      const projectData = {
        title: formData.get("title"),
        description: formData.get("description"),
        tags: tags,
        githubUrl: formData.get("githubUrl"),
        liveUrl: formData.get("liveUrl"),
        imageUrl,
        showcaseImages: currentShowcaseImages,
        featured: formData.get("featured") === "on",
        order: Number(formData.get("order") || 0)
      };

      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), projectData);
        setEditingProject(null);
      } else {
        await addDoc(collection(db, "projects"), projectData);
      }
      (e.target as HTMLFormElement).reset();
      alert("Project saved!");
    } catch (err) {
      console.error("Error saving project:", err);
      alert("Failed to save project.");
    }
  };

  const handleCertificationSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get("image") as File;
    let imageUrl = editingCertification?.imageUrl || "";

    try {
      if (file && file.size > 0) {
        const filePath = `certifications/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('portfolio-assets').upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const certData = {
        title: formData.get("title"),
        issuer: formData.get("issuer"),
        date: formData.get("date"),
        imageUrl
      };

      if (editingCertification) {
        await updateDoc(doc(db, "certifications", editingCertification.id), certData);
        setEditingCertification(null);
      } else {
        await addDoc(collection(db, "certifications"), certData);
      }
      (e.target as HTMLFormElement).reset();
      alert("Certification saved!");
    } catch (err) {
      console.error("Error saving certification:", err);
      alert("Failed to save certification.");
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      {/* Mobile hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-darkbrown/10 hover:bg-darkbrown/20 text-darkbrown p-2 rounded-lg transition-colors"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle menu"
      >
        {sidebarOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-darkbrown/30 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-[#EAE4D3] border-r border-darkbrown/10 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <h2 className="font-serif text-2xl text-rust mb-8 pt-6 pl-5">Dashboard</h2>
        <nav className="flex flex-col gap-1 flex-grow px-2">
          {["Profile", "Skills", "Projects", "Certifications", "Messages"].map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab.toLowerCase()); setSidebarOpen(false); }}
              className={activeTab === tab.toLowerCase() ? classes.sidebarLinkActive : classes.sidebarLinkInactive}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="mt-8 pt-6 border-t border-darkbrown/10 flex flex-col gap-4 px-5 pb-6">
          <Link href="/" className="font-mono text-xs uppercase tracking-widest text-darkbrown/60 hover:text-rust transition-colors">
            ← Back to Site
          </Link>
          <button onClick={handleLogout} className="text-left font-mono text-xs uppercase tracking-widest text-rust hover:text-darkbrown transition-colors">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow p-4 md:p-8 overflow-y-auto min-h-screen bg-[#F3EEE1]">
        <h1 className="font-serif text-[clamp(1.5rem,5vw,2.5rem)] text-rust mt-6 ml-10 md:ml-6 mb-5 capitalize">{activeTab}</h1>
        
        {activeTab === "profile" && (
          <div className="flex flex-col gap-8">
            <form onSubmit={handleProfileSubmit} className={`${classes.card} p-4 sm:p-6 flex flex-col gap-5`}>
              <h2 className="font-serif text-2xl text-darkbrown mt-2 mb-4">Edit Profile &amp; Resume</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Name</label>
                  <input name="name" defaultValue={profile?.name} required className={classes.input} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Title</label>
                  <input name="title" defaultValue={profile?.title} required className={classes.input} />
                </div>
                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Bio</label>
                  <textarea name="bio" defaultValue={profile?.bio} required rows={4} className={`${classes.input} resize-none`} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Location</label>
                  <input name="location" defaultValue={profile?.location} required className={classes.input} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Email</label>
                  <input name="email" type="email" defaultValue={profile?.email} required className={classes.input} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Phone</label>
                  <input name="phone" defaultValue={profile?.phone} required className={classes.input} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">GitHub URL</label>
                  <input name="githubUrl" defaultValue={profile?.githubUrl} required className={classes.input} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">LinkedIn URL</label>
                  <input name="linkedinUrl" defaultValue={profile?.linkedinUrl} required className={classes.input} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Profile Photo (Upload new to replace)</label>
                  <input type="file" name="photo" accept="image/*" className="border border-[rgba(58,46,38,0.15)] rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(181,80,45,0.1)] transition-all duration-150 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-rust/10 file:text-rust hover:file:bg-rust/20" />
                  {profile?.photoUrl && (
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden relative group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        <button type="button" onClick={handleRemoveProfilePhoto} className="absolute top-0 right-0 bg-darkbrown/80 text-cream w-4 h-4 rounded-full flex items-center justify-center text-[10px] hover:bg-rust transition-colors leading-none pb-[1px]" aria-label="Remove photo">&times;</button>
                      </div>
                      <p className="text-xs text-darkbrown/50 line-clamp-1">{profile.photoUrl.split('/').pop()?.split('?')[0]}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Resume PDF (Upload new to replace)</label>
                  <input type="file" name="resume" accept="application/pdf" className="border border-[rgba(58,46,38,0.15)] rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(181,80,45,0.1)] transition-all duration-150 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-rust/10 file:text-rust hover:file:bg-rust/20" />
                  {profile?.resumeUrl && (
                    <div className="flex items-center gap-4 mt-1">
                      <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className={classes.buttonSecondary}>View Current Resume</a>
                      <button type="button" onClick={handleRemoveResume} className={`${classes.buttonSecondary} flex items-center gap-1`}>
                        <span className="text-[14px] leading-none pb-[1px]">&times;</span> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <button type="submit" disabled={isSavingProfile} className={`w-full sm:w-auto sm:self-start mt-2 ${classes.buttonPrimary}`}>
                {isSavingProfile ? "Saving..." : "Save Profile & Resume"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="flex flex-col gap-8">
            <form onSubmit={handleSkillSubmit} className={`${classes.card} p-4 sm:p-6 flex flex-col gap-4`}>
              <h2 className="font-serif text-2xl text-darkbrown mt-2 mb-4">{editingSkill ? "Edit Skill" : "Add Skill"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <input name="name" required placeholder="Skill Name" defaultValue={editingSkill?.name} className={classes.input} />
                <input name="category" required placeholder="Category (e.g. Frontend, Tools, Cloud…)" defaultValue={editingSkill?.category || ""} className={classes.input} />
                <div className="flex flex-col justify-center">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Proficiency (1-100)</label>
                  <input type="range" name="proficiency" min="1" max="100" defaultValue={editingSkill?.proficiency || 50} className="w-full accent-rust" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="submit" className={`w-full sm:w-auto ${classes.buttonPrimary}`}>
                  {editingSkill ? "Update Skill" : "Add Skill"}
                </button>
                {editingSkill && (
                  <button type="button" onClick={() => setEditingSkill(null)} className={`w-full sm:w-auto ${classes.buttonSecondary}`}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-4 mt-8">
              <h2 className="font-serif text-2xl text-darkbrown mt-2 mb-4">Existing Skills</h2>
              {skills.length === 0 ? <p className="text-darkbrown/60">No skills found.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map(skill => (
                    <div key={skill.id} className={`${classes.card} p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3`}>
                      <div className="min-w-0">
                        <h3 className="font-sans font-medium text-lg truncate">{skill.name}</h3>
                        <p className="text-sm text-darkbrown/70">{skill.category} — {skill.proficiency}%</p>
                      </div>
                      <div className="flex flex-wrap gap-2 items-center shrink-0">
                        <button onClick={() => setEditingSkill(skill)} className={classes.buttonSecondary}>Edit</button>
                        <button onClick={async () => {
                          if (confirm("Delete this skill?")) await deleteDoc(doc(db, "skills", skill.id));
                        }} className={classes.buttonDelete}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "projects" && (
          <div className="flex flex-col gap-8">
            <form onSubmit={handleProjectSubmit} className={`${classes.card} p-4 sm:p-6 flex flex-col gap-4`}>
              <h2 className="font-serif text-2xl text-darkbrown mt-2 mb-4">{editingProject ? "Edit Project" : "Add Project"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="title" required placeholder="Project Title" defaultValue={editingProject?.title} className={classes.input} />
                <input name="tags" required placeholder="Tags (comma separated)" defaultValue={editingProject?.tags.join(", ")} className={classes.input} />
                <div className="sm:col-span-2">
                  <textarea name="description" required placeholder="Project Description" defaultValue={editingProject?.description} rows={3} className={`${classes.input} resize-none`} />
                </div>
                <input name="githubUrl" type="url" placeholder="GitHub URL" defaultValue={editingProject?.githubUrl} className={classes.input} />
                <input name="liveUrl" type="url" placeholder="Live URL" defaultValue={editingProject?.liveUrl} className={classes.input} />
                
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Project Image (Leave blank to keep existing)</label>
                  <input type="file" name="image" accept="image/*" className="border border-[rgba(58,46,38,0.15)] rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(181,80,45,0.1)] transition-all duration-150 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-rust/10 file:text-rust hover:file:bg-rust/20" />
                  {editingProject?.imageUrl && (
                    <div className="relative w-32 h-24 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editingProject.imageUrl} alt="Project preview" className="w-full h-full object-cover rounded-[6px]" />
                      <button type="button" onClick={handleRemoveProjectImage} className="absolute -top-2 -right-2 bg-darkbrown text-cream w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-rust transition-colors shadow-sm leading-none pb-[1px] z-10" aria-label="Remove image">&times;</button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 sm:col-span-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Showcase Images (Upload multiple)</label>
                  <input type="file" multiple name="showcaseImages" accept="image/jpeg, image/png, image/webp" className="border border-[rgba(58,46,38,0.15)] rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(181,80,45,0.1)] transition-all duration-150 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-rust/10 file:text-rust hover:file:bg-rust/20" />
                  
                  {editingProject?.showcaseImages && editingProject.showcaseImages.length > 0 && (
                    <div className="flex gap-4 mt-2 overflow-x-auto pb-2 no-scrollbar">
                      {editingProject.showcaseImages.map((url, i) => (
                        <div key={i} className="relative w-24 h-16 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Showcase preview" className="w-full h-full object-cover rounded-[6px]" />
                          <button type="button" onClick={() => handleRemoveShowcaseImage(url)} className="absolute -top-2 -right-2 bg-darkbrown text-cream w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-rust transition-colors shadow-sm leading-none pb-[1px] z-10" aria-label="Remove image">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="featured" defaultChecked={editingProject?.featured} className="accent-rust w-4 h-4" />
                    <span className="font-mono text-xs uppercase text-darkbrown/80">Featured</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-xs uppercase text-darkbrown/80">Order:</label>
                    <input type="number" name="order" defaultValue={editingProject?.order || 0} className={`${classes.input} w-24 text-center px-2 py-1`} />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="submit" className={`w-full sm:w-auto ${classes.buttonPrimary}`}>
                  {editingProject ? "Update Project" : "Add Project"}
                </button>
                {editingProject && (
                  <button type="button" onClick={() => setEditingProject(null)} className={`w-full sm:w-auto ${classes.buttonSecondary}`}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-4 mt-8">
              <h2 className="font-serif text-2xl text-darkbrown mt-2 mb-4">Existing Projects</h2>
              {projects.length === 0 ? <p className="text-darkbrown/60">No projects found.</p> : (
                <div className="grid grid-cols-1 gap-4">
                  {projects.map(proj => (
                    <div key={proj.id} className={`${classes.card} p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start`}>
                      {proj.imageUrl && (
                        <div className="w-full sm:w-28 h-24 bg-darkbrown/5 flex-shrink-0 relative overflow-hidden rounded-[8px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-grow w-full min-w-0">
                        <div className="flex justify-between gap-2">
                          <h3 className="font-sans font-medium text-lg flex items-center gap-2 flex-wrap">
                            {proj.title}
                            {proj.featured && <span className={classes.badge}>Featured</span>}
                          </h3>
                          <span className="font-mono text-xs text-darkbrown/50 shrink-0">Order: {proj.order}</span>
                        </div>
                        <p className="text-sm text-darkbrown/70 line-clamp-2 mt-1">{proj.description}</p>
                        <p className="text-xs font-mono text-darkbrown/50 mt-2 truncate">Tags: {proj.tags.join(", ")}</p>
                      </div>
                      <div className="flex flex-wrap sm:flex-col gap-2 shrink-0 sm:items-end mt-1 sm:mt-0">
                        <button onClick={() => setEditingProject(proj)} className={classes.buttonSecondary}>Edit</button>
                        <button onClick={async () => {
                          if (confirm("Delete this project?")) await deleteDoc(doc(db, "projects", proj.id));
                        }} className={classes.buttonDelete}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {activeTab === "messages" && (
          <div className="flex flex-col gap-4">
            {messages.length === 0 ? (
              <p className="font-sans text-darkbrown/60">No messages yet.</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`${classes.card} p-5 sm:p-6 flex flex-col ${msg.read ? 'opacity-75' : 'border-rust'}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0">
                      <h3 className="font-sans font-medium text-lg text-darkbrown truncate">{msg.name}</h3>
                      <a href={`mailto:${msg.email}`} className="font-mono text-xs text-rust hover:underline block mt-1 truncate">{msg.email}</a>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-darkbrown/40 shrink-0 pt-1">
                      {msg.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-sans text-darkbrown/80 whitespace-pre-wrap mt-3">{msg.message}</p>
                  
                  <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-darkbrown/10">
                    <button 
                      onClick={() => markAsRead(msg.id, msg.read)}
                      className={classes.buttonSecondary}
                    >
                      {msg.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className={classes.buttonDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        
        {activeTab === "certifications" && (
          <div className="flex flex-col gap-8">
            <form onSubmit={handleCertificationSubmit} className={`${classes.card} p-4 sm:p-6 flex flex-col gap-4`}>
              <h2 className="font-serif text-2xl text-darkbrown mt-2 mb-4">{editingCertification ? "Edit Certification" : "Add Certification"}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input name="title" required placeholder="Title" defaultValue={editingCertification?.title} className={classes.input} />
                <input name="issuer" required placeholder="Issuer" defaultValue={editingCertification?.issuer} className={classes.input} />
                <input name="date" required placeholder="Date (e.g., 2026-04-24)" defaultValue={editingCertification?.date} className={classes.input} />
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Certificate Image (Leave blank to keep existing)</label>
                  <input type="file" name="image" accept="image/*" className="border border-[rgba(58,46,38,0.15)] rounded-lg px-3 py-2 bg-transparent focus:outline-none focus:border-rust focus:shadow-[0_0_0_3px_rgba(181,80,45,0.1)] transition-all duration-150 file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-mono file:bg-rust/10 file:text-rust hover:file:bg-rust/20" />
                  {editingCertification?.imageUrl && (
                    <div className="relative w-32 h-24 mt-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={editingCertification.imageUrl} alt="Certificate preview" className="w-full h-full object-cover rounded-[6px]" />
                      <button type="button" onClick={handleRemoveCertificationImage} className="absolute -top-2 -right-2 bg-darkbrown text-cream w-5 h-5 rounded-full flex items-center justify-center text-xs hover:bg-rust transition-colors shadow-sm leading-none pb-[1px] z-10" aria-label="Remove image">&times;</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <button type="submit" className={`w-full sm:w-auto ${classes.buttonPrimary}`}>
                  {editingCertification ? "Update Certification" : "Add Certification"}
                </button>
                {editingCertification && (
                  <button type="button" onClick={() => setEditingCertification(null)} className={`w-full sm:w-auto ${classes.buttonSecondary}`}>
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-4 mt-8">
              <h2 className="font-serif text-2xl text-darkbrown mt-2 mb-4">Existing Certifications</h2>
              {certifications.length === 0 ? <p className="text-darkbrown/60">No certifications found.</p> : [...certifications].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((cert) => (
                <div key={cert.id} className={`${classes.card} p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start gap-4`}>
                  <div className="min-w-0">
                    <h3 className="font-sans font-medium text-lg truncate">{cert.title}</h3>
                    <p className="text-sm text-darkbrown/70 mt-1">{cert.issuer} — {cert.date}</p>
                    {cert.imageUrl && <a href={cert.imageUrl.startsWith('http') ? cert.imageUrl : `/images/${cert.imageUrl}`} target="_blank" rel="noopener noreferrer" className={`mt-2 inline-block ${classes.buttonSecondary}`}>View Image</a>}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center shrink-0">
                    <button onClick={() => setEditingCertification(cert)} className={classes.buttonSecondary}>Edit</button>
                    <button onClick={async () => {
                      if (confirm("Delete this certification?")) await deleteDoc(doc(db, "certifications", cert.id));
                    }} className={classes.buttonDelete}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
