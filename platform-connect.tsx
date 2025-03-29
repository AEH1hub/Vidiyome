import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Youtube, Instagram, ExternalLink, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { askForSecrets } from "@/lib/utils";

interface PlatformConnectionProps {
  platform: string;
  isConnected: boolean;
  authUrl?: string;
  onConnect: () => void;
}

function PlatformConnection({ platform, isConnected, authUrl, onConnect }: PlatformConnectionProps) {
  const { toast } = useToast();
  
  const handleConnect = async () => {
    // First check if we need API keys/credentials for this platform
    // We'll directly call askForSecrets which handles the API key/secret requests
    await askForSecrets(platform);
    
    // In the real implementation, after obtaining the API keys through the Replit secrets tool,
    // we would check again if the platform is properly configured by making a request
    // to our backend API that would verify if the required secrets are now available
    
    if (!authUrl) {
      toast({
        title: "API Keys Required",
        description: `Please set up API keys for ${platform} to connect your account.`,
        variant: "destructive"
      });
      return;
    }
    
    // Open the authentication URL in a new window
    const authWindow = window.open(authUrl, `${platform}-auth`, "width=600,height=700");
    
    // Poll to check if window was closed
    const checkWindow = setInterval(() => {
      if (authWindow?.closed) {
        clearInterval(checkWindow);
        onConnect();
      }
    }, 1000);
  };
  
  // Get the platform name and icon
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  
  let PlatformIcon;
  let platformColor;
  let platformDescription;
  
  switch (platform) {
    case 'youtube':
      PlatformIcon = Youtube;
      platformColor = "text-red-500";
      platformDescription = "Publish your videos directly to your YouTube channel.";
      break;
    case 'instagram':
      PlatformIcon = Instagram;
      platformColor = "text-pink-500";
      platformDescription = "Share your videos on Instagram with automatic format conversion.";
      break;
    case 'tiktok':
      PlatformIcon = () => (
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      );
      platformColor = "text-black dark:text-white";
      platformDescription = "Post your videos on TikTok with perfect sizing and trending hashtags.";
      break;
    default:
      PlatformIcon = ExternalLink;
      platformColor = "text-primary";
      platformDescription = "Connect to this platform to share your content.";
  }
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 ${platformColor}`}>
              <PlatformIcon className="h-6 w-6" />
            </div>
            <CardTitle>{platformName}</CardTitle>
          </div>
          
          {isConnected ? (
            <span className="text-sm text-green-500 flex items-center">
              <CheckCircle className="w-4 h-4 mr-1" />
              Connected
            </span>
          ) : (
            <span className="text-sm text-gray-500 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Not Connected
            </span>
          )}
        </div>
        <CardDescription>{platformDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleConnect}
          className={isConnected ? "w-full bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200" : "w-full"}
          variant={isConnected ? "outline" : "default"}
        >
          {isConnected ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Reconnect
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Account
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export function PlatformConnections() {
  const { toast } = useToast();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Fetch available platforms
  const { data: platformsData } = useQuery({
    queryKey: ['/api/social-media/platforms'],
    queryFn: async () => {
      const response = await fetch('/api/social-media/platforms');
      if (!response.ok) throw new Error('Failed to fetch platforms');
      return response.json();
    }
  });
  
  // Fetch platform auth URLs
  const platformsQuery = useQuery({
    queryKey: ['/api/social-media/platforms/auth', refreshTrigger],
    queryFn: async () => {
      // Here we'd make individual requests for each platform's auth URL
      // For demo purposes, we'll create a structure with placeholders
      const platforms = ['youtube', 'instagram', 'tiktok'];
      const results: Record<string, { authUrl: string | null, isConfigured: boolean }> = {};
      
      for (const platform of platforms) {
        try {
          const response = await fetch(`/api/social-media/auth-url/${platform}`);
          if (response.ok) {
            const data = await response.json();
            results[platform] = { 
              authUrl: data.authUrl,
              isConfigured: true
            };
          } else {
            results[platform] = { 
              authUrl: null,
              isConfigured: false
            };
          }
        } catch (error) {
          console.error(`Error fetching auth URL for ${platform}:`, error);
          results[platform] = { 
            authUrl: null,
            isConfigured: false
          };
        }
      }
      
      return results;
    }
  });
  
  const handleConnect = () => {
    // Refresh the auth URLs after connection attempt
    setRefreshTrigger(prev => prev + 1);
    
    // In real implementation, we'd check if the connection was successful
    toast({
      title: "Connection Initiated",
      description: "Please complete the authentication in the opened window."
    });
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* YouTube */}
      <PlatformConnection
        platform="youtube"
        isConnected={false}
        authUrl={platformsQuery.data?.youtube?.authUrl || undefined}
        onConnect={handleConnect}
      />
      
      {/* Instagram */}
      <PlatformConnection
        platform="instagram"
        isConnected={false}
        authUrl={platformsQuery.data?.instagram?.authUrl || undefined}
        onConnect={handleConnect}
      />
      
      {/* TikTok */}
      <PlatformConnection
        platform="tiktok"
        isConnected={false}
        authUrl={platformsQuery.data?.tiktok?.authUrl || undefined}
        onConnect={handleConnect}
      />
    </div>
  );
}