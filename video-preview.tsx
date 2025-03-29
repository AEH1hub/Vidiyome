import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Film, Youtube, Instagram, ExternalLink, Download, Share2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import placeholderVideo from "@/assets/placeholder-video.svg";

interface VideoPreviewProps {
  isGenerating: boolean;
  previewData: any | null;
  selectedPlatforms: string[];
}

export function VideoPreview({ isGenerating, previewData, selectedPlatforms }: VideoPreviewProps) {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishResults, setPublishResults] = useState<any[] | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Simulate progress when generating
  useEffect(() => {
    if (isGenerating) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          const increment = Math.random() * 10;
          const newProgress = Math.min(prev + increment, 95); // Caps at 95% until complete
          return newProgress;
        });
      }, 500);
      
      return () => clearInterval(interval);
    } else if (previewData) {
      setProgress(100);
    }
  }, [isGenerating, previewData]);

  // Handle video playback
  const togglePlayback = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  // Handle download video
  const handleDownload = () => {
    if (!previewData || !previewData.videoUrl) {
      toast({
        title: "No video available",
        description: "Please generate a video first.",
        variant: "destructive"
      });
      return;
    }

    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = previewData.videoUrl;
    link.download = `${previewData.title || 'video'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your video download has started."
    });
  };

  // Handle publish to social media
  const handlePublish = async () => {
    if (!previewData || !previewData.id) {
      toast({
        title: "Cannot publish",
        description: "You need to save this video before publishing",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "No platforms selected",
        description: "Please select at least one platform to publish to.",
        variant: "destructive"
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      const response = await apiRequest({
        method: "POST", 
        url: `/api/videos/${previewData.id}/publish`,
        body: { platforms: selectedPlatforms }
      });
      
      if (!response.ok) {
        throw new Error("Failed to publish video");
      }
      
      const data = await response.json();
      setPublishResults(data.results);
      
      // Check if there were any successful publishes
      const successfulPublishes = data.results.filter((r: any) => r.success);
      
      if (successfulPublishes.length > 0) {
        toast({
          title: "Publishing successful",
          description: `Video published to ${successfulPublishes.length} platform(s)`,
        });
      } else {
        toast({
          title: "Publishing failed",
          description: "Could not publish to any platforms. Check the platform authentication.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error publishing video:", error);
      toast({
        title: "Publishing failed",
        description: "An error occurred while publishing the video.",
        variant: "destructive"
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    // Use our custom icon with different background colors based on platform
    const Icon = platform === "youtube" 
      ? Youtube 
      : platform === "instagram" 
        ? Instagram 
        : null;
    
    if (Icon) {
      return <Icon className="h-4 w-4 text-white" />;
    }
    
    if (platform === "tiktok") {
      return (
        <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
    }
    
    // Fallback to a generic icon if no specific icon
    return <ExternalLink className="h-4 w-4 text-white" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Video Preview</h3>
        <div className="text-sm text-gray-500 dark:text-gray-400">Step 1 of 3</div>
      </div>
      
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
        {previewData && previewData.videoUrl ? (
          <div className="w-full h-full">
            {/* Use actual video element for generated content */}
            <video 
              ref={videoRef}
              src={previewData.videoUrl} 
              poster={previewData.thumbnailUrl || placeholderVideo}
              className="w-full h-full object-contain"
              onEnded={() => setIsPlaying(false)}
              controls={false}
            />
            
            {/* Custom play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center" onClick={togglePlayback}>
              <Button 
                size="icon" 
                variant="ghost"
                className="rounded-full w-16 h-16 bg-black/40 backdrop-blur-sm hover:bg-black/60"
              >
                {isPlaying ? (
                  <Pause className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white ml-1" />
                )}
              </Button>
            </div>
            
            {/* Action buttons */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/40"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              
              <Button 
                size="sm" 
                variant="secondary" 
                className="bg-white/20 backdrop-blur-sm hover:bg-white/40"
                onClick={handlePublish}
                disabled={isPublishing || !previewData.id}
              >
                <Share2 className="w-4 h-4 mr-1" />
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="w-full h-full">
            <img src={placeholderVideo} alt="AI Video Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center bg-black/50 backdrop-blur-sm p-4 rounded-lg">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-primary/30 flex items-center justify-center">
                  <Film className="text-white text-2xl" />
                </div>
                <p className="text-white text-sm">
                  {isGenerating 
                    ? "Generating your video preview..." 
                    : "Enter your prompt and click \"Generate Video\" to preview"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        {isGenerating && (
          <div>
            <h4 className="text-sm font-medium mb-2">Generation Progress</h4>
            <div className="flex items-center space-x-2">
              <Progress value={progress} className="h-2 flex-1" />
              <span className="text-xs text-gray-500 dark:text-gray-400">{Math.floor(progress)}%</span>
            </div>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium mb-2">Publishing Options</h4>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {selectedPlatforms.map((platform) => (
                  <div key={platform} className="p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        platform === "youtube" ? "bg-red-500" : 
                        platform === "instagram" ? "bg-pink-500" : 
                        platform === "tiktok" ? "bg-black" : "bg-primary"
                      }`}>
                        {getPlatformIcon(platform)}
                      </span>
                      <span className="ml-2 text-sm capitalize">{platform}</span>
                    </div>
                    
                    {/* Connection status indicator */}
                    {publishResults ? (
                      // Show status based on publish results
                      publishResults.find((r) => r.platform === platform)?.success ? (
                        <span className="text-xs text-green-500 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                          Connected
                        </span>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-xs text-red-500 hover:text-red-600">
                          Connect Account
                        </Button>
                      )
                    ) : (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs text-gray-500 hover:text-primary"
                      >
                        Connect Account
                      </Button>
                    )}
                  </div>
                ))}
                
                {selectedPlatforms.length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    Select platforms to publish to
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
