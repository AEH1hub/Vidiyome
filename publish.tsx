import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Video } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Youtube, Instagram, ExternalLink, Calendar, Clock, Users, Settings } from "lucide-react";
import { VideoCard } from "@/components/videos/video-card";
import { PlatformConnections } from "@/components/videos/platform-connect";
import { askForSecrets } from "@/lib/utils";

export default function Publish() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { data: videos, isLoading } = useQuery<Video[]>({
    queryKey: ['/api/videos'],
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "youtube":
        return <Youtube className="h-5 w-5 text-red-500" />;
      case "instagram":
        return <Instagram className="h-5 w-5 text-pink-500" />;
      case "tiktok":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-neutral dark:bg-gray-950 text-dark dark:text-white">
      {sidebarOpen && <Sidebar />}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Publish Content" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">Publish & Distribute</h1>
            <p className="text-gray-600 dark:text-gray-400">Manage and schedule your content across multiple platforms</p>
          </div>
          
          <Tabs defaultValue="ready" className="mb-6">
            <TabsList className="mb-6">
              <TabsTrigger value="ready">Ready to Publish</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
              <TabsTrigger value="published">Published</TabsTrigger>
              <TabsTrigger value="platforms">Connect Platforms</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ready">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h2 className="text-lg font-medium mb-4">Content Ready for Publishing</h2>
                  
                  {isLoading ? (
                    Array.from({ length: 2 }).map((_, index) => (
                      <Card key={index} className="mb-4">
                        <CardContent className="p-4">
                          <div className="flex">
                            <Skeleton className="w-24 h-16 rounded-md mr-4" />
                            <div className="flex-1">
                              <Skeleton className="h-5 w-3/4 mb-2" />
                              <Skeleton className="h-4 w-1/2" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : videos && videos.filter(v => v.status === "draft").length > 0 ? (
                    videos.filter(v => v.status === "draft").map((video) => (
                      <Card key={video.id} className="mb-4">
                        <CardContent className="p-4">
                          <div className="flex">
                            <div className="relative w-24 h-16 rounded-md overflow-hidden mr-4 bg-gray-100 dark:bg-gray-800">
                              {video.thumbnailUrl ? (
                                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-base mb-1">{video.title}</h3>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <Clock className="w-3 h-3 mr-1" />
                                {video.duration}
                              </div>
                              <div className="flex items-center space-x-2">
                                {(video.platforms || []).map((platform, idx) => (
                                  <div key={idx}>
                                    {getPlatformIcon(platform)}
                                  </div>
                                ))}
                              </div>
                            </div>
                            <div className="ml-4 flex items-start">
                              <Button size="sm">Publish</Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                          No content ready for publishing
                        </p>
                        <Button>Create New Video</Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg font-medium mb-4">Publishing Settings</h2>
                  <Card>
                    <CardHeader>
                      <CardTitle>Platform Settings</CardTitle>
                      <CardDescription>Configure your publishing preferences for each platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center">
                            <Youtube className="h-5 w-5 text-red-500 mr-3" />
                            <div>
                              <h3 className="font-medium">YouTube</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center">
                            <Instagram className="h-5 w-5 text-pink-500 mr-3" />
                            <div>
                              <h3 className="font-medium">Instagram</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                        
                        <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                          <div className="flex items-center">
                            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                            </svg>
                            <div>
                              <h3 className="font-medium">TikTok</h3>
                              <p className="text-xs text-gray-500 dark:text-gray-400">Connected</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Add New Platform
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="scheduled">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Upcoming Posts</CardTitle>
                      <Button variant="outline" size="sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">
                        No scheduled posts yet
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Best Times to Post</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center mb-2">
                          <Youtube className="h-4 w-4 text-red-500 mr-2" />
                          <h3 className="font-medium text-sm">YouTube</h3>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Weekdays: 2-4 PM</p>
                          <p>Weekends: 10-11 AM</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <Instagram className="h-4 w-4 text-pink-500 mr-2" />
                          <h3 className="font-medium text-sm">Instagram</h3>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Weekdays: 11 AM-1 PM</p>
                          <p>Weekends: 10 AM-12 PM</p>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-2">
                          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                          </svg>
                          <h3 className="font-medium text-sm">TikTok</h3>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Weekdays: 7-9 PM</p>
                          <p>Weekends: 4-7 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Publishing Calendar</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Calendar className="h-16 w-16 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400">
                        No upcoming scheduled posts
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">View Calendar</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="published">
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2">Published Content</h2>
                <p className="text-gray-600 dark:text-gray-400">View and manage your published content across platforms</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
                      <Skeleton className="w-full aspect-video" />
                      <div className="p-4">
                        <Skeleton className="h-6 w-full mb-2" />
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : videos && videos.filter(v => v.status === "completed").length > 0 ? (
                  videos.filter(v => v.status === "completed").map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title || "Untitled Video"}
                      thumbnailUrl={video.thumbnailUrl || undefined}
                      duration={video.duration || "0:00"}
                      createdAt={new Date(video.createdAt)}
                      platforms={video.platforms || []}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center p-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-200 mb-1">No published content yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Your published videos will appear here</p>
                    <Button>Create and Publish</Button>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="platforms">
              <div className="mb-6">
                <h2 className="text-lg font-medium mb-2">Connect Your Social Media Accounts</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  Link your accounts to publish videos directly to these platforms
                </p>
              </div>
              
              {/* Platform Connections Component */}
              <PlatformConnections />
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-500/5 dark:to-red-600/5">
                    <div className="flex items-center mb-2">
                      <Youtube className="h-8 w-8 text-red-500 mr-3" />
                      <CardTitle>YouTube</CardTitle>
                    </div>
                    <CardDescription>Connect your YouTube channel to publish videos</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">Connection Status</p>
                        <p className="text-sm text-green-500">Connected</p>
                      </div>
                      <Button variant="outline" size="sm">Disconnect</Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">Channel: <span className="text-gray-700 dark:text-gray-300">VideoGenius Official</span></p>
                      <p className="text-gray-500 dark:text-gray-400">Subscribers: <span className="text-gray-700 dark:text-gray-300">1.2K</span></p>
                      <p className="text-gray-500 dark:text-gray-400">Last sync: <span className="text-gray-700 dark:text-gray-300">Today, 10:30 AM</span></p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Channel Settings</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 dark:from-pink-500/5 dark:to-purple-600/5">
                    <div className="flex items-center mb-2">
                      <Instagram className="h-8 w-8 text-pink-500 mr-3" />
                      <CardTitle>Instagram</CardTitle>
                    </div>
                    <CardDescription>Connect your Instagram account to publish reels and posts</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">Connection Status</p>
                        <p className="text-sm text-green-500">Connected</p>
                      </div>
                      <Button variant="outline" size="sm">Disconnect</Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">Account: <span className="text-gray-700 dark:text-gray-300">@videogenius</span></p>
                      <p className="text-gray-500 dark:text-gray-400">Followers: <span className="text-gray-700 dark:text-gray-300">3.4K</span></p>
                      <p className="text-gray-500 dark:text-gray-400">Last sync: <span className="text-gray-700 dark:text-gray-300">Today, 11:15 AM</span></p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Account Settings</Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader className="bg-gradient-to-r from-gray-500/10 to-gray-600/10 dark:from-gray-400/5 dark:to-gray-500/5">
                    <div className="flex items-center mb-2">
                      <svg className="h-8 w-8 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                      <CardTitle>TikTok</CardTitle>
                    </div>
                    <CardDescription>Connect your TikTok account to publish short-form videos</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-medium">Connection Status</p>
                        <p className="text-sm text-green-500">Connected</p>
                      </div>
                      <Button variant="outline" size="sm">Disconnect</Button>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-gray-500 dark:text-gray-400">Account: <span className="text-gray-700 dark:text-gray-300">@videogenius</span></p>
                      <p className="text-gray-500 dark:text-gray-400">Followers: <span className="text-gray-700 dark:text-gray-300">2.7K</span></p>
                      <p className="text-gray-500 dark:text-gray-400">Last sync: <span className="text-gray-700 dark:text-gray-300">Yesterday, 4:20 PM</span></p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">Account Settings</Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
