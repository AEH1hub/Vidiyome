import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { VideoCard } from "@/components/videos/video-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Video } from "@shared/schema";
import { Grid, List, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useLocation } from "wouter";

export default function MyContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [location, navigate] = useLocation();
  const { toast } = useToast();

  const { data: videos, isLoading, error } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  // Filter videos based on search query and filter
  const filteredVideos = videos?.filter((video) => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          video.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === "all") return matchesSearch;
    if (filter === "youtube") return matchesSearch && video.platforms.includes("youtube");
    if (filter === "instagram") return matchesSearch && video.platforms.includes("instagram");
    if (filter === "tiktok") return matchesSearch && video.platforms.includes("tiktok");
    
    return matchesSearch;
  });

  const handleVideoClick = (videoId: number) => {
    navigate(`/videos/${videoId}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral dark:bg-gray-950 text-dark dark:text-white">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="My Content" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h1 className="text-2xl font-bold">My Videos</h1>
            
            <div className="flex items-center space-x-2">
              <Link href="/create-video">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Video
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 mb-6">
            <div className="p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search videos..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="flex rounded-md border border-gray-200 dark:border-gray-800">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="rounded-none rounded-l-md"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="rounded-none rounded-r-md"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className={`bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 ${viewMode === "list" ? "flex" : ""}`}>
                  <Skeleton className={`${viewMode === "list" ? "w-48" : "w-full"} aspect-video`} />
                  <div className="p-4 flex-1">
                    <Skeleton className="h-6 w-full mb-2" />
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredVideos && filteredVideos.length > 0 ? (
            <div className={`grid ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"} gap-6`}>
              {filteredVideos.map((video) => (
                <VideoCard 
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  thumbnailUrl={video.thumbnailUrl}
                  duration={video.duration}
                  createdAt={new Date(video.createdAt)}
                  platforms={video.platforms}
                  onClick={() => handleVideoClick(video.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-1">No videos found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || filter !== "all" ? "Try adjusting your search or filter" : "Create your first AI video to get started"}
              </p>
              <Link href="/create-video">
                <Button>Create Video</Button>
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
