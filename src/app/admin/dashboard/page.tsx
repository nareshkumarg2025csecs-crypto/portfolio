"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { auth, db, storage } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Link from "next/link";

interface Certification {
  id: string;
  title: string;
  issuer: string;
  date: string;
  imageUrl?: string;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("messages");
  const [messages, setMessages] = useState<Record<string, unknown>[]>([]);
  const [certifications, setCertifications] = useState<Certification[]>([]);

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
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    // Subscribe to certifications
    const unsubCerts = onSnapshot(collection(db, "certifications"), (snapshot) => {
      const certs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Certification));
      setCertifications(certs);
    });
    
    return () => {
      unsubMsgs();
      unsubCerts();
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

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-darkbrown/5 border-r border-darkbrown/10 flex flex-col p-6">
        <h2 className="font-serif text-2xl text-rust mb-8">Dashboard</h2>
        
        <nav className="flex flex-col gap-2 flex-grow">
          {["Profile", "Skills", "Projects", "Certifications", "Messages", "Resume"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`text-left font-mono text-xs uppercase tracking-widest p-3 transition-colors ${activeTab === tab.toLowerCase() ? 'bg-rust text-cream' : 'text-darkbrown/70 hover:bg-darkbrown/10'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
        
        <div className="mt-8 pt-6 border-t border-darkbrown/10 flex flex-col gap-4">
          <Link href="/" className="font-mono text-xs uppercase tracking-widest text-darkbrown/60 hover:text-rust transition-colors">
            ← Back to Site
          </Link>
          <button 
            onClick={handleLogout}
            className="text-left font-mono text-xs uppercase tracking-widest text-rust hover:text-darkbrown transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto max-h-screen">
        <h1 className="font-serif text-4xl text-darkbrown mb-8 capitalize">{activeTab}</h1>
        
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

              if (file && file.size > 0) {
                const storageRef = ref(storage, `certifications/${file.name}`);
                await uploadBytes(storageRef, file);
                imageUrl = await getDownloadURL(storageRef);
              }

              const newDoc = {
                title: formData.get("title"),
                issuer: formData.get("issuer"),
                date: formData.get("date"),
                imageUrl: imageUrl
              };
              console.log("Saving certification to Firestore:", newDoc);
              try {
                await addDoc(collection(db, "certifications"), newDoc);
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
        
        {activeTab !== "messages" && activeTab !== "certifications" && (
          <div className="p-8 border border-darkbrown/10 bg-white/50 border-dashed text-center">
            <p className="font-sans text-darkbrown/60">
              CRUD interface for {activeTab} would connect to Firestore here.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
