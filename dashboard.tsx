import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentProjects } from "@/components/dashboard/recent-projects";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { PlatformPerformance } from "@/components/dashboard/platform-performance";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-neutral dark:bg-gray-950 text-dark dark:text-white">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <QuickActions />
          <RecentProjects />
          <AnalyticsOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PlatformPerformance />
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
