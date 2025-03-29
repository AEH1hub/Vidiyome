import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";
import { PageContainer } from "@/components/layout/page-container";
import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { PlatformPerformance } from "@/components/dashboard/platform-performance";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Analytics() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeRange, setTimeRange] = useState("7days");
  
  const timeRanges = [
    { value: "7days", label: "Last 7 days" },
    { value: "30days", label: "Last 30 days" },
    { value: "90days", label: "Last 90 days" }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-neutral dark:bg-gray-950 text-dark dark:text-white">
      {sidebarOpen && <Sidebar />}
      
      <PageContainer>
        <Header 
          title="Analytics" 
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Analytics Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your content performance across platforms</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <AnalyticsOverview />
          
          <Tabs defaultValue="overview" className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="platforms">Platform Breakdown</TabsTrigger>
              <TabsTrigger value="content">Content Performance</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <AnalyticsCharts />
                <PlatformPerformance />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Content Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-800">
                          <th className="text-left font-medium text-sm py-3 px-4">Video</th>
                          <th className="text-left font-medium text-sm py-3 px-4">Platform</th>
                          <th className="text-left font-medium text-sm py-3 px-4">Views</th>
                          <th className="text-left font-medium text-sm py-3 px-4">Engagement</th>
                          <th className="text-left font-medium text-sm py-3 px-4">CTR</th>
                          <th className="text-left font-medium text-sm py-3 px-4">Published</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-6 bg-gray-100 dark:bg-gray-800 rounded mr-3"></div>
                              <span className="font-medium">Product Launch</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-red-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                              </svg>
                              YouTube
                            </div>
                          </td>
                          <td className="py-3 px-4">2,453</td>
                          <td className="py-3 px-4">7.8%</td>
                          <td className="py-3 px-4">3.2%</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400">2 days ago</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-6 bg-gray-100 dark:bg-gray-800 rounded mr-3"></div>
                              <span className="font-medium">Marketing Tips</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-pink-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                              </svg>
                              Instagram
                            </div>
                          </td>
                          <td className="py-3 px-4">1,872</td>
                          <td className="py-3 px-4">9.3%</td>
                          <td className="py-3 px-4">4.1%</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400">1 week ago</td>
                        </tr>
                        <tr className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-10 h-6 bg-gray-100 dark:bg-gray-800 rounded mr-3"></div>
                              <span className="font-medium">Tutorial Series</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                              </svg>
                              TikTok
                            </div>
                          </td>
                          <td className="py-3 px-4">3,427</td>
                          <td className="py-3 px-4">12.5%</td>
                          <td className="py-3 px-4">5.8%</td>
                          <td className="py-3 px-4 text-gray-500 dark:text-gray-400">2 weeks ago</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="platforms" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Platform-specific analytics would go here */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-500/5 dark:to-red-600/5">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-red-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                      <CardTitle>YouTube Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                        <p className="text-xl font-semibold">5.8K</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Watch Time</p>
                        <p className="text-xl font-semibold">248 hrs</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Subscribers</p>
                        <p className="text-xl font-semibold">+124</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Engagement</p>
                        <p className="text-xl font-semibold">7.2%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-gradient-to-r from-pink-500/10 to-purple-600/10 dark:from-pink-500/5 dark:to-purple-600/5">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 text-pink-500 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                      </svg>
                      <CardTitle>Instagram Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                        <p className="text-xl font-semibold">4.2K</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Reach</p>
                        <p className="text-xl font-semibold">7.8K</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
                        <p className="text-xl font-semibold">+86</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Engagement</p>
                        <p className="text-xl font-semibold">9.3%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="bg-gradient-to-r from-gray-500/10 to-gray-600/10 dark:from-gray-400/5 dark:to-gray-500/5">
                    <div className="flex items-center">
                      <svg className="w-6 h-6 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                      </svg>
                      <CardTitle>TikTok Analytics</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Views</p>
                        <p className="text-xl font-semibold">4.2K</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Watch Time</p>
                        <p className="text-xl font-semibold">172 hrs</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
                        <p className="text-xl font-semibold">+152</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Engagement</p>
                        <p className="text-xl font-semibold">12.5%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="content" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Content Performance</CardTitle>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                    Detailed content performance analytics will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="audience" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Audience Demographics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500 dark:text-gray-400 text-center py-12">
                    Audience demographics and insights will be displayed here
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </PageContainer>
    </div>
  );
}
