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
  featured: boolean;
  order: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [messages, setMessages] = useState<Message[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

    try {
      console.log("Auth current user before project save:", auth.currentUser);
      if (file && file.size > 0) {
        const filePath = `projects/${Date.now()}_${file.name}`;
        const { error } = await supabase.storage.from('portfolio-assets').upload(filePath, file);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
        imageUrl = publicUrl;
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

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-darkbrown/5 border-r border-darkbrown/10 flex flex-col p-6">
        <h2 className="font-serif text-2xl text-rust mb-8">Dashboard</h2>
        <nav className="flex flex-col gap-2 flex-grow">
          {["Profile", "Skills", "Projects", "Certifications", "Messages", "Resume"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`text-left font-mono text-xs uppercase tracking-widest p-3 transition-colors ${activeTab === tab.toLowerCase() || (activeTab === 'profile' && tab === 'Resume') ? 'bg-rust text-cream' : 'text-darkbrown/70 hover:bg-darkbrown/10'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="mt-8 pt-6 border-t border-darkbrown/10 flex flex-col gap-4">
          <Link href="/" className="font-mono text-xs uppercase tracking-widest text-darkbrown/60 hover:text-rust transition-colors">
            ← Back to Site
          </Link>
          <button onClick={handleLogout} className="text-left font-mono text-xs uppercase tracking-widest text-rust hover:text-darkbrown transition-colors">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-h-screen bg-[#F3EEE1]">
        <h1 className="font-serif text-4xl text-rust mb-8 capitalize">{activeTab === 'resume' ? 'Profile' : activeTab}</h1>
        
        {(activeTab === "profile" || activeTab === "resume") && (
          <div className="flex flex-col gap-8">
            <form onSubmit={handleProfileSubmit} className="bg-white/50 border border-darkbrown/10 p-6 flex flex-col gap-6 shadow-sm">
              <h2 className="font-serif text-2xl text-darkbrown">Edit Profile & Resume</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Name</label>
                  <input name="name" defaultValue={profile?.name} required className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Title</label>
                  <input name="title" defaultValue={profile?.title} required className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Bio</label>
                  <textarea name="bio" defaultValue={profile?.bio} required rows={4} className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust resize-none" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Location</label>
                  <input name="location" defaultValue={profile?.location} required className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Email</label>
                  <input name="email" type="email" defaultValue={profile?.email} required className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Phone</label>
                  <input name="phone" defaultValue={profile?.phone} required className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">GitHub URL</label>
                  <input name="githubUrl" defaultValue={profile?.githubUrl} required className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">LinkedIn URL</label>
                  <input name="linkedinUrl" defaultValue={profile?.linkedinUrl} required className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Profile Photo (Upload new to replace)</label>
                  <input type="file" name="photo" accept="image/*" className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                  {profile?.photoUrl && (
                    <p className="text-xs text-darkbrown/50 mt-1">Current: {profile.photoUrl.split('/').pop()?.split('?')[0]}</p>
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Resume PDF (Upload new to replace)</label>
                  <input type="file" name="resume" accept="application/pdf" className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                  {profile?.resumeUrl && (
                    <a href={profile.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-rust hover:underline mt-1">View Current Resume</a>
                  )}
                </div>
              </div>
              
              <button type="submit" disabled={isSavingProfile} className="self-start mt-4 bg-rust text-cream font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-darkbrown transition-colors disabled:opacity-50">
                {isSavingProfile ? "Saving..." : "Save Profile & Resume"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "skills" && (
          <div className="flex flex-col gap-8">
            <form onSubmit={handleSkillSubmit} className="bg-white/50 border border-darkbrown/10 p-6 flex flex-col gap-4 shadow-sm">
              <h2 className="font-serif text-2xl text-darkbrown">{editingSkill ? "Edit Skill" : "Add Skill"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input name="name" required placeholder="Skill Name" defaultValue={editingSkill?.name} className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                <input name="category" required placeholder="Category (e.g. Frontend, Tools, Cloud…)" defaultValue={editingSkill?.category || ""} className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                <div className="flex flex-col justify-center">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Proficiency (1-100)</label>
                  <input type="range" name="proficiency" min="1" max="100" defaultValue={editingSkill?.proficiency || 50} className="w-full accent-rust" />
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button type="submit" className="bg-rust text-cream font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-darkbrown transition-colors">
                  {editingSkill ? "Update Skill" : "Add Skill"}
                </button>
                {editingSkill && (
                  <button type="button" onClick={() => setEditingSkill(null)} className="font-mono text-xs uppercase tracking-widest px-6 py-3 text-darkbrown hover:text-rust transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-4 mt-8">
              <h2 className="font-serif text-2xl text-darkbrown">Existing Skills</h2>
              {skills.length === 0 ? <p className="text-darkbrown/60">No skills found.</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {skills.map(skill => (
                    <div key={skill.id} className="p-4 border border-darkbrown/10 bg-white shadow-sm flex justify-between items-center">
                      <div>
                        <h3 className="font-sans font-medium text-lg">{skill.name}</h3>
                        <p className="text-sm text-darkbrown/70">{skill.category} — {skill.proficiency}%</p>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setEditingSkill(skill)} className="text-xs font-mono uppercase tracking-widest text-darkbrown hover:text-rust transition-colors">Edit</button>
                        <button onClick={async () => {
                          if (confirm("Delete this skill?")) await deleteDoc(doc(db, "skills", skill.id));
                        }} className="text-xs font-mono uppercase tracking-widest text-rust hover:text-darkbrown transition-colors">Delete</button>
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
            <form onSubmit={handleProjectSubmit} className="bg-white/50 border border-darkbrown/10 p-6 flex flex-col gap-4 shadow-sm">
              <h2 className="font-serif text-2xl text-darkbrown">{editingProject ? "Edit Project" : "Add Project"}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" required placeholder="Project Title" defaultValue={editingProject?.title} className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                <input name="tags" required placeholder="Tags (comma separated)" defaultValue={editingProject?.tags.join(", ")} className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                <div className="md:col-span-2">
                  <textarea name="description" required placeholder="Project Description" defaultValue={editingProject?.description} rows={3} className="w-full border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust resize-none" />
                </div>
                <input name="githubUrl" type="url" placeholder="GitHub URL" defaultValue={editingProject?.githubUrl} className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                <input name="liveUrl" type="url" placeholder="Live URL" defaultValue={editingProject?.liveUrl} className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                
                <div className="flex flex-col gap-2">
                  <label className="font-mono text-xs uppercase text-darkbrown/60">Project Image (Leave blank to keep existing)</label>
                  <input type="file" name="image" accept="image/*" className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                </div>
                
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="featured" defaultChecked={editingProject?.featured} className="accent-rust w-4 h-4" />
                    <span className="font-mono text-xs uppercase text-darkbrown/80">Featured</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label className="font-mono text-xs uppercase text-darkbrown/80">Order:</label>
                    <input type="number" name="order" defaultValue={editingProject?.order || 0} className="w-16 border-b border-darkbrown/20 bg-transparent text-center focus:outline-none focus:border-rust" />
                  </div>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                <button type="submit" className="bg-rust text-cream font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-darkbrown transition-colors">
                  {editingProject ? "Update Project" : "Add Project"}
                </button>
                {editingProject && (
                  <button type="button" onClick={() => setEditingProject(null)} className="font-mono text-xs uppercase tracking-widest px-6 py-3 text-darkbrown hover:text-rust transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="flex flex-col gap-4 mt-8">
              <h2 className="font-serif text-2xl text-darkbrown">Existing Projects</h2>
              {projects.length === 0 ? <p className="text-darkbrown/60">No projects found.</p> : (
                <div className="grid grid-cols-1 gap-4">
                  {projects.map(proj => (
                    <div key={proj.id} className="p-4 border border-darkbrown/10 bg-white shadow-sm flex flex-col md:flex-row gap-4 items-center">
                      {proj.imageUrl && (
                        <div className="w-full md:w-32 h-24 bg-darkbrown/5 flex-shrink-0 relative overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={proj.imageUrl} alt={proj.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-grow w-full">
                        <div className="flex justify-between">
                          <h3 className="font-sans font-medium text-lg flex items-center gap-2">
                            {proj.title}
                            {proj.featured && <span className="bg-rust/10 text-rust text-[10px] uppercase px-2 py-0.5 rounded">Featured</span>}
                          </h3>
                          <span className="font-mono text-xs text-darkbrown/50">Order: {proj.order}</span>
                        </div>
                        <p className="text-sm text-darkbrown/70 line-clamp-2 mt-1">{proj.description}</p>
                        <p className="text-xs font-mono text-darkbrown/50 mt-2">Tags: {proj.tags.join(", ")}</p>
                      </div>
                      <div className="flex md:flex-col gap-4 w-full md:w-auto justify-end">
                        <button onClick={() => setEditingProject(proj)} className="text-xs font-mono uppercase tracking-widest text-darkbrown hover:text-rust transition-colors">Edit</button>
                        <button onClick={async () => {
                          if (confirm("Delete this project?")) await deleteDoc(doc(db, "projects", proj.id));
                        }} className="text-xs font-mono uppercase tracking-widest text-rust hover:text-darkbrown transition-colors">Delete</button>
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
                <div key={msg.id} className={`p-6 border ${msg.read ? 'border-darkbrown/10 bg-white/30' : 'border-rust bg-white'} shadow-sm`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-sans font-medium text-lg text-darkbrown">{msg.name}</h3>
                      <a href={`mailto:${msg.email}`} className="font-mono text-xs text-rust hover:underline">{msg.email}</a>
                    </div>
                    <span className="font-mono text-[10px] uppercase text-darkbrown/40">
                      {msg.createdAt?.toDate().toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-sans text-darkbrown/80 whitespace-pre-wrap">{msg.message}</p>
                  
                  <div className="mt-6 flex gap-4 pt-4 border-t border-darkbrown/10">
                    <button 
                      onClick={() => markAsRead(msg.id, msg.read)}
                      className="font-mono text-xs uppercase tracking-widest text-darkbrown/60 hover:text-rust"
                    >
                      {msg.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      className="font-mono text-xs uppercase tracking-widest text-rust/70 hover:text-rust"
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
            <form onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const file = formData.get("image") as File;
              let imageUrl = "";

              console.log("Auth current user before certification save:", auth.currentUser);

              try {
                if (file && file.size > 0) {
                  console.log("Uploading file to Supabase Storage...");
                  const filePath = `certifications/${Date.now()}_${file.name}`;
                  const { error } = await supabase.storage.from('portfolio-assets').upload(filePath, file);
                  if (error) throw error;
                  const { data: { publicUrl } } = supabase.storage.from('portfolio-assets').getPublicUrl(filePath);
                  imageUrl = publicUrl;
                  console.log("File uploaded successfully, URL:", imageUrl);
                }

                const newDoc = {
                  title: formData.get("title"),
                  issuer: formData.get("issuer"),
                  date: formData.get("date"),
                  imageUrl: imageUrl
                };
                console.log("Saving certification to Firestore:", newDoc);
                const docRef = await addDoc(collection(db, "certifications"), newDoc);
                console.log("Certification added with ID:", docRef.id);
                (e.target as HTMLFormElement).reset();
                alert("Certification added!");
              } catch (err) {
                console.error("Error adding doc:", err);
                alert("Failed to add certification.");
              }
            }} className="bg-white/50 border border-darkbrown/10 p-6 flex flex-col gap-4 shadow-sm">
              <h2 className="font-serif text-2xl text-darkbrown">Add Certification</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" required placeholder="Title" className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                <input name="issuer" required placeholder="Issuer" className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                <input name="date" required placeholder="Date (e.g., 2026-04-24)" className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
                <input type="file" name="image" accept="image/*" className="border-b border-darkbrown/20 bg-transparent py-2 focus:outline-none focus:border-rust" />
              </div>
              <button type="submit" className="self-start mt-4 bg-rust text-cream font-mono text-xs uppercase tracking-widest px-6 py-3 hover:bg-darkbrown transition-colors">
                Save Certification
              </button>
            </form>

            <div className="flex flex-col gap-4 mt-8">
              <h2 className="font-serif text-2xl text-darkbrown">Existing Certifications</h2>
              {certifications.length === 0 ? <p className="text-darkbrown/60">No certifications found.</p> : [...certifications].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((cert) => (
                <div key={cert.id} className="p-4 border border-darkbrown/10 bg-white shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-sans font-medium text-lg">{cert.title}</h3>
                    <p className="text-sm text-darkbrown/70">{cert.issuer} — {cert.date}</p>
                    {cert.imageUrl && <a href={cert.imageUrl.startsWith('http') ? cert.imageUrl : `/images/${cert.imageUrl}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-rust hover:underline mt-1 inline-block">View Image</a>}
                  </div>
                  <button onClick={async () => {
                    if (confirm("Delete this certification?")) await deleteDoc(doc(db, "certifications", cert.id));
                  }} className="text-xs font-mono uppercase tracking-widest text-rust hover:text-darkbrown transition-colors">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
