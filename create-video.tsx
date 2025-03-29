import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { VideoGenerator } from "@/components/videos/video-generator";

export default function CreateVideo() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral dark:bg-gray-950 text-dark dark:text-white">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Create Video" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <VideoGenerator />
        </main>
      </div>
    </div>
  );
}
