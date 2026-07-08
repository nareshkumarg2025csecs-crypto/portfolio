import ShowcaseGallery from "@/components/ShowcaseGallery";
import Link from "next/link";
import { notFound } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const revalidate = 0;

interface ShowcasePageProps {
  params: {
    projectId: string;
  };
}

export default async function ShowcasePage({ params }: ShowcasePageProps) {
  const { projectId } = params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let projectData: any = null;
  try {
    const docRef = doc(db, "projects", projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      projectData = { id: docSnap.id, ...docSnap.data() };
    }
  } catch (error) {
    console.error("Error fetching project:", error);
  }

  if (!projectData || !projectData.showcaseImages || projectData.showcaseImages.length === 0) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#F3EEE1] text-darkbrown py-24 px-6 sm:px-12 md:px-24 selection:bg-rust selection:text-cream">
      {/* Background Texture with Overlay */}
      <div className="fixed inset-0 z-[-2] bg-[url('/textures/bg-texture.jpg')] bg-repeat" style={{ backgroundSize: '300px' }}></div>
      <div className="fixed inset-0 z-[-1] bg-[#F3EEE1]/85"></div>

      <div className="max-w-5xl mx-auto flex flex-col gap-12 relative z-10">
        <div className="flex flex-col gap-6">
          <Link href="/#projects" className="cursor-hover inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-darkbrown/60 hover:text-rust transition-colors w-max">
            ← Back to Projects
          </Link>

          <div>
            <h1 className="font-serif italic text-5xl md:text-7xl text-rust tracking-tighter uppercase mb-4">
              {projectData.title} <span className="font-sans not-italic text-darkbrown/40 text-3xl md:text-5xl lowercase">showcase</span>
            </h1>
            <p className="font-sans text-darkbrown/80 text-lg md:text-xl max-w-3xl leading-relaxed">
              {projectData.description}
            </p>
          </div>
        </div>

        <ShowcaseGallery images={projectData.showcaseImages} projectTitle={projectData.title} />
      </div>
    </main>
  );
}
