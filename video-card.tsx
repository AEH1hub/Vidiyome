import { Play, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import placeholderThumbnail from "@/assets/placeholder-thumbnail.svg";

interface VideoCardProps {
  id: number;
  title: string;
  thumbnailUrl?: string;
  duration: string;
  createdAt: Date;
  platforms: string[];
  onClick?: () => void;
}

export function VideoCard({ 
  id, 
  title, 
  thumbnailUrl, 
  duration, 
  createdAt, 
  platforms, 
  onClick 
}: VideoCardProps) {
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return format(date, "MMM d, yyyy");
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube":
        return (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </span>
        );
      case "instagram":
        return (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-pink-500 text-white text-xs">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
          </span>
        );
      case "tiktok":
        return (
          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-black text-white text-xs">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      className="video-card bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <img src={placeholderThumbnail} alt={title} className="w-full h-full object-cover" />
        )}
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-5 h-5 text-white" />
          </div>
        </div>
        
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
          {duration}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-medium mb-1 truncate">{title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Clock className="w-3 h-3 mr-1" />
            {getRelativeTime(createdAt)}
          </div>
          <div className="flex items-center space-x-1">
            {platforms.map((platform, index) => (
              <div key={index} className="transition-transform hover:scale-110">
                {getPlatformIcon(platform)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
