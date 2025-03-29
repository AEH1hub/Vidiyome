import { useState } from "react";
import { PageContainer } from "@/components/layout/page-container";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { Check, Play, Search, ThumbsUp, Timer, Crown, Star, ScrollText, Palette, Loader2 } from "lucide-react";
import { ASPECT_RATIO_OPTIONS, DURATION_OPTIONS, VIDEO_STYLES } from "@/lib/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Define the Template interface to match the server schema
interface Template {
  id: number;
  title: string;
  description: string;
  category: string;
  style: string;
  duration: string;
  thumbUrl: string | null;
  previewUrl: string | null;
  popular: boolean;
  premium: boolean;
  settings: Record<string, any> | null;
  createdAt: string;
}

// Template categories
const categories = [
  { value: "all", label: "All Templates" },
  { value: "Marketing", label: "Marketing" },
  { value: "Social Media", label: "Social Media" },
  { value: "Education", label: "Education" },
  { value: "E-commerce", label: "E-commerce" },
  { value: "Technology", label: "Technology" },
];

// Generate svg placeholder for thumbnails
const generateThumbnailPlaceholder = (title: string, style: string) => {
  const bgColors: Record<string, string> = {
    professional: "#4A90E2",
    minimalist: "#F5F5F5",
    energetic: "#FF7043",
    cinematic: "#263238",
    custom: "#8E24AA"
  };

  const textColors: Record<string, string> = {
    professional: "#FFFFFF",
    minimalist: "#333333",
    energetic: "#FFFFFF",
    cinematic: "#FFFFFF",
    custom: "#FFFFFF"
  };

  const bgColor = bgColors[style] || "#6366F1";
  const textColor = textColors[style] || "#FFFFFF";
  
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="${bgColor}" />
    <text x="150" y="100" font-family="Arial" font-size="16" fill="${textColor}" text-anchor="middle">${title}</text>
    <text x="150" y="125" font-family="Arial" font-size="12" fill="${textColor}" text-anchor="middle">${style} style</text>
  </svg>`;
};

export default function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Fetch templates from API
  const { data: templates = [], isLoading, isError } = useQuery<Template[]>({ 
    queryKey: ['/api/templates'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Filter templates based on search, category, duration, and style
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchQuery === "" || 
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === "all" || template.category === activeCategory;
    
    const matchesDuration = selectedDuration === null || template.duration === selectedDuration;
    
    const matchesStyle = selectedStyle === null || template.style === selectedStyle;
    
    return matchesSearch && matchesCategory && matchesDuration && matchesStyle;
  });

  // Function to use template
  const useTemplate = (templateId: number) => {
    // In a real app, this would redirect to the create-video page with the template pre-loaded
    toast({
      title: "Template Selected",
      description: "You've selected a template. Now you can customize it.",
    });
  };

  // Function to preview template
  const previewTemplate = (templateId: number) => {
    toast({
      title: "Template Preview",
      description: "Opening template preview...",
    });
  };

  // Toggle filter for duration
  const toggleDurationFilter = (duration: string) => {
    if (selectedDuration === duration) {
      setSelectedDuration(null);
    } else {
      setSelectedDuration(duration);
    }
  };

  // Toggle filter for style
  const toggleStyleFilter = (style: string) => {
    if (selectedStyle === style) {
      setSelectedStyle(null);
    } else {
      setSelectedStyle(style);
    }
  };

  return (
    <PageContainer>
      <Header title="Video Templates" description="Browse and use professional video templates" />
      
      <div className="space-y-6">
        {/* Search bar */}
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Categories tabs */}
        <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="mb-4 flex flex-wrap h-auto">
            {categories.map(category => (
              <TabsTrigger key={category.value} value={category.value}>
                {category.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Filter pills for duration */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm text-muted-foreground pt-1 pr-2 flex items-center">
              <Timer className="h-4 w-4 mr-1" />
              Duration:
            </span>
            {DURATION_OPTIONS.map(duration => (
              <Badge 
                key={duration.value}
                variant={selectedDuration === duration.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleDurationFilter(duration.value)}
              >
                {duration.label}
              </Badge>
            ))}
          </div>
          
          {/* Filter pills for style */}
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-sm text-muted-foreground pt-1 pr-2 flex items-center">
              <Palette className="h-4 w-4 mr-1" />
              Style:
            </span>
            {VIDEO_STYLES.map(style => (
              <Badge 
                key={style.id}
                variant={selectedStyle === style.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => toggleStyleFilter(style.id)}
              >
                {style.label}
              </Badge>
            ))}
          </div>
          
          {/* Loading state */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <h3 className="text-lg font-medium">Loading templates...</h3>
            </div>
          )}

          {/* Error state */}
          {isError && (
            <div className="text-center py-12">
              <div className="h-12 w-12 mx-auto text-destructive mb-4">⚠️</div>
              <h3 className="text-lg font-medium">Failed to load templates</h3>
              <p className="text-muted-foreground mt-1">
                There was an error loading the templates. Please try refreshing the page.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/templates'] })}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Templates grid */}
          {!isLoading && !isError && categories.map(category => (
            <TabsContent key={category.value} value={category.value} className="mt-6">
              {filteredTemplates.length === 0 ? (
                <div className="text-center py-12">
                  <ScrollText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No templates found</h3>
                  <p className="text-muted-foreground mt-1">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredTemplates.map((template: Template) => (
                    <Card key={template.id} className="overflow-hidden flex flex-col h-full">
                      <div className="relative">
                        {template.thumbUrl ? (
                          <img 
                            src={template.thumbUrl} 
                            alt={template.title}
                            onError={(e) => {
                              // If image fails to load, use SVG placeholder
                              (e.target as HTMLImageElement).src = generateThumbnailPlaceholder(template.title, template.style);
                            }}
                            className="w-full h-40 object-cover" 
                          />
                        ) : (
                          <div
                            className="w-full h-40 flex items-center justify-center"
                            style={{ backgroundImage: `url(${generateThumbnailPlaceholder(template.title, template.style)})` }}
                          />
                        )}
                        
                        {template.popular && (
                          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-md flex items-center">
                            <ThumbsUp className="h-3 w-3 mr-1" />
                            Popular
                          </div>
                        )}
                        
                        {template.premium && (
                          <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-md flex items-center">
                            <Crown className="h-3 w-3 mr-1" />
                            Premium
                          </div>
                        )}
                        
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="absolute bottom-2 right-2 h-8 w-8 rounded-full opacity-90"
                          onClick={() => previewTemplate(template.id)}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{template.title}</CardTitle>
                        <CardDescription className="line-clamp-2 h-10">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0 pb-2 flex-grow">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.style}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {template.duration}
                          </Badge>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="pt-0">
                        <Button 
                          onClick={() => useTemplate(template.id)}
                          size="sm"
                          className="w-full"
                          disabled={template.premium}
                        >
                          <Link href="/create-video" className="flex items-center justify-center w-full">
                            <Check className="h-4 w-4 mr-2" />
                            {template.premium ? 'Premium Template' : 'Use Template'}
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </PageContainer>
  );
}