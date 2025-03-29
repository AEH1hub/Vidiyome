import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer } from "@/components/layout/page-container";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Info, AlertCircle, Check, ArrowRight, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form schema for SEO optimization
const seoFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(60, "Title should be under 60 characters"),
  description: z.string().min(50, "Description must be at least 50 characters").max(160, "Description should be under 160 characters"),
  keywords: z.string().min(3, "Add at least a few keywords"),
  platform: z.enum(["youtube", "tiktok", "instagram", "all"]),
  contentType: z.enum(["video", "image", "text"]),
});

type SeoFormValues = z.infer<typeof seoFormSchema>;

// Mock optimization data - would be replaced with actual API calls in production
const optimizationSuggestions = {
  title: {
    youtube: [
      "Use emotional triggers in your title",
      "Include numbers (e.g., '5 Ways to...')",
      "Keep between 40-60 characters for optimal display",
      "Include primary keyword near the beginning"
    ],
    tiktok: [
      "Keep titles short and catchy",
      "Use emojis strategically",
      "Include trending hashtags",
      "Create curiosity or FOMO"
    ],
    instagram: [
      "Use relevant emojis",
      "Keep it conversational",
      "Ask a question to engage viewers",
      "Include a call to action"
    ]
  },
  description: {
    youtube: [
      "First 2-3 lines are crucial (visible before 'Show more')",
      "Include primary and secondary keywords naturally",
      "Add timestamps for longer videos",
      "Include relevant links and calls to action"
    ],
    tiktok: [
      "Use relevant hashtags (3-5 is optimal)",
      "Keep it casual and conversational",
      "Create excitement or curiosity",
      "Include a call to action"
    ],
    instagram: [
      "Use a mix of niche and broad hashtags",
      "Break text into readable paragraphs",
      "Include a question to encourage comments",
      "Mention other accounts when relevant"
    ]
  },
  keywords: {
    youtube: [
      "Include primary keyword in title, description and tags",
      "Use a mix of broad and specific niche keywords",
      "Research trending keywords in your niche",
      "Include some long-tail keywords"
    ],
    tiktok: [
      "Research trending hashtags",
      "Use a mix of broad, niche, and trending tags",
      "Don't exceed 4-5 hashtags",
      "Include location-based tags if relevant"
    ],
    instagram: [
      "Use up to 30 hashtags maximum",
      "Mix popular, niche and branded hashtags",
      "Research competitor hashtags",
      "Create a branded hashtag for your content"
    ]
  }
};

// Tags suggestions based on inputs
const getSuggestedTags = (input: string, platform: string) => {
  const keywords = input.split(',').map(k => k.trim().toLowerCase());
  
  const commonTags = [
    "trending", "viral", "trending2025", "fyp", "foryoupage", 
    "content", "socialmedia", "digitalmarketing", "creator"
  ];
  
  const platformSpecificTags: Record<string, string[]> = {
    youtube: ["youtube", "youtuber", "youtubechannel", "youtubevideos", "subscribe"],
    tiktok: ["tiktok", "tiktokviral", "tiktoktrending", "tiktoker", "tiktokmarketing"],
    instagram: ["instagram", "instagramreels", "instagrammarketing", "igdaily", "instagrammers"]
  };
  
  // Combine common tags with platform-specific ones
  const baseTags = [...commonTags];
  if (platform !== "all") {
    baseTags.push(...(platformSpecificTags[platform] || []));
  } else {
    Object.values(platformSpecificTags).forEach(tags => {
      baseTags.push(...tags);
    });
  }
  
  // Add keyword-based tags
  const keywordTags = keywords.flatMap(keyword => {
    if (keyword.length < 3) return [];
    return [
      keyword,
      `${keyword}tips`,
      `${keyword}hacks`,
      `${keyword}ideas`,
      `best${keyword}`
    ];
  });
  
  // Combine and remove duplicates
  const allTags = Array.from(new Set([...baseTags, ...keywordTags]));
  
  return allTags.slice(0, 15); // Return top 15 tags
};

export default function SeoOptimizer() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [scoreTitle, setScoreTitle] = useState(0);
  const [scoreDescription, setScoreDescription] = useState(0);
  const [scoreKeywords, setScoreKeywords] = useState(0);
  const [optimizedText, setOptimizedText] = useState("");
  const { toast } = useToast();

  // Form setup
  const form = useForm<SeoFormValues>({
    resolver: zodResolver(seoFormSchema),
    defaultValues: {
      title: "",
      description: "",
      keywords: "",
      platform: "all",
      contentType: "video",
    },
  });

  // Watch form values for real-time suggestions
  const platform = form.watch("platform");
  const title = form.watch("title");
  const description = form.watch("description");
  const keywords = form.watch("keywords");

  // Update suggestions based on selected platform
  useEffect(() => {
    if (platform) {
      const allSuggestions = [
        ...(optimizationSuggestions.title[platform === "all" ? "youtube" : platform] || []),
        ...(optimizationSuggestions.description[platform === "all" ? "youtube" : platform] || []),
        ...(optimizationSuggestions.keywords[platform === "all" ? "youtube" : platform] || [])
      ];
      setSuggestions(allSuggestions);
    }
  }, [platform]);

  // Update tag suggestions when any content changes
  useEffect(() => {
    // Extract potential keywords from title and description if they exist
    let extractedKeywords = keywords;
    
    // If there's a title but no keywords, try to extract keywords from title
    if (title && (!keywords || keywords.trim() === "")) {
      // Remove common words and split by spaces
      const titleWords = title.toLowerCase()
        .replace(/the|and|or|of|to|a|in|for|with|on|at|by|from|an/g, "")
        .split(/\s+/)
        .filter(word => word.length > 3)
        .join(", ");
      
      extractedKeywords = titleWords;
    }
    
    // If there's a description but still no keywords, extract from description
    if (description && (!extractedKeywords || extractedKeywords.trim() === "")) {
      // Get the most significant words from description
      const descWords = description.toLowerCase()
        .replace(/the|and|or|of|to|a|in|for|with|on|at|by|from|an/g, "")
        .split(/\s+/)
        .filter(word => word.length > 3)
        .slice(0, 5)  // Take the first 5 significant words
        .join(", ");
      
      extractedKeywords = descWords;
    }
    
    // Generate tags based on available content
    if (extractedKeywords && extractedKeywords.trim() !== "") {
      const tags = getSuggestedTags(extractedKeywords, platform);
      setSuggestedTags(tags);
      
      // If we auto-generated keywords and the user hasn't set any, update the form
      if (!keywords || keywords.trim() === "") {
        form.setValue("keywords", extractedKeywords);
      }
    }
  }, [title, description, keywords, platform, form]);

  // Calculate SEO scores
  useEffect(() => {
    // Title score calculation
    let titleScore = 0;
    if (title.length > 0) {
      if (title.length >= 5 && title.length <= 60) titleScore += 30;
      if (title.length >= 20 && title.length <= 50) titleScore += 10;
      if (title.includes("?") || title.includes("!")) titleScore += 10;
      if (/\d/.test(title)) titleScore += 10; // Contains numbers
      if (keywords.split(",").some(k => title.toLowerCase().includes(k.trim().toLowerCase()))) titleScore += 40;
    }
    setScoreTitle(titleScore);

    // Description score calculation
    let descScore = 0;
    if (description.length > 0) {
      if (description.length >= 50 && description.length <= 160) descScore += 30;
      if (description.length >= 80 && description.length <= 140) descScore += 10;
      if (description.includes("?") || description.includes("!")) descScore += 5;
      if (description.toLowerCase().includes("how") || 
          description.toLowerCase().includes("why") || 
          description.toLowerCase().includes("what")) descScore += 10;
      
      // Check if keywords are in description
      const keywordList = keywords.split(",").map(k => k.trim().toLowerCase());
      const keywordsFound = keywordList.filter(k => 
        k.length > 2 && description.toLowerCase().includes(k)
      ).length;
      
      descScore += Math.min(keywordsFound * 15, 45); // Up to 45 points for keywords
    }
    setScoreDescription(descScore);

    // Keywords score calculation
    let keywordsScore = 0;
    if (keywords.length > 0) {
      const keywordList = keywords.split(",").map(k => k.trim());
      keywordsScore += Math.min(keywordList.length * 10, 50); // Up to 50 points for number of keywords
      
      // Check if there are both short and long keywords
      const hasShortKeywords = keywordList.some(k => k.length <= 5 && k.length >= 2);
      const hasLongKeywords = keywordList.some(k => k.length > 5);
      
      if (hasShortKeywords && hasLongKeywords) keywordsScore += 20;
      
      // Check if there are location keywords
      const hasLocationKeyword = keywordList.some(k => 
        k.toLowerCase().includes("city") || 
        k.toLowerCase().includes("town") || 
        k.toLowerCase().includes("state") || 
        k.toLowerCase().includes("country")
      );
      
      if (hasLocationKeyword) keywordsScore += 15;
      
      // Limit to 100
      keywordsScore = Math.min(keywordsScore, 100);
    }
    setScoreKeywords(keywordsScore);
  }, [title, description, keywords]);

  // Form submission handler - would send to API in production
  const onSubmit = (data: SeoFormValues) => {
    // In a real application, this would send the data to the backend for processing
    console.log("SEO data submitted:", data);
    
    // Simulate optimization
    const optimizedTextSample = generateOptimizedText(data);
    setOptimizedText(optimizedTextSample);
    
    toast({
      title: "SEO Analysis Complete",
      description: "Your content has been optimized for better discoverability.",
    });
  };

  // Generate optimized text based on form data
  const generateOptimizedText = (data: SeoFormValues) => {
    const keywordList = data.keywords.split(",").map(k => k.trim());
    const primaryKeyword = keywordList[0] || "";
    
    let optimizedTitle = data.title;
    
    // Add emotional words if not present
    const emotionalWords = ["amazing", "incredible", "essential", "powerful", "ultimate"];
    const hasEmotionalWord = emotionalWords.some(word => data.title.toLowerCase().includes(word));
    
    if (!hasEmotionalWord && data.title.length < 45) {
      const randomEmotional = emotionalWords[Math.floor(Math.random() * emotionalWords.length)];
      optimizedTitle = `The ${randomEmotional} ${data.title}`;
    }
    
    // Enhance description
    let enhancedDescription = data.description;
    if (!data.description.includes("!") && !data.description.includes("?")) {
      enhancedDescription += " Discover how this can transform your results!";
    }
    
    // Add hashtags
    const hashtags = suggestedTags.map(tag => `#${tag}`).join(" ");
    
    // Platform-specific enhancements
    let platformTips = "";
    switch(data.platform) {
      case "youtube":
        platformTips = "▶️ Don't forget to like, subscribe, and hit the notification bell!";
        break;
      case "tiktok":
        platformTips = "📱 Follow for more content like this! #fyp #foryoupage";
        break;
      case "instagram":
        platformTips = "📷 Double tap if you found this helpful! ✨";
        break;
      default:
        platformTips = "👍 Follow for more content like this!";
    }
    
    return `
${optimizedTitle}

${enhancedDescription}

${platformTips}

${hashtags}
    `.trim();
  };

  // Copy optimized text to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(optimizedText);
    toast({
      title: "Copied to clipboard",
      description: "The optimized text has been copied to your clipboard.",
    });
  };

  return (
    <PageContainer>
      <Header title="SEO Optimizer" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        {/* Main form */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Social Media SEO Optimizer</CardTitle>
            <CardDescription>
              Optimize your content for better visibility and engagement on social platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Platform</FormLabel>
                      <div className="flex flex-wrap gap-3">
                        <FormControl>
                          <Tabs 
                            defaultValue="all" 
                            value={field.value} 
                            onValueChange={field.onChange}
                            className="w-full"
                          >
                            <TabsList className="grid grid-cols-4">
                              <TabsTrigger value="all">All Platforms</TabsTrigger>
                              <TabsTrigger value="youtube">YouTube</TabsTrigger>
                              <TabsTrigger value="tiktok">TikTok</TabsTrigger>
                              <TabsTrigger value="instagram">Instagram</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <div className="flex flex-wrap gap-3">
                        <FormControl>
                          <Tabs 
                            defaultValue="video" 
                            value={field.value} 
                            onValueChange={field.onChange}
                            className="w-full"
                          >
                            <TabsList className="grid grid-cols-3">
                              <TabsTrigger value="video">Video</TabsTrigger>
                              <TabsTrigger value="image">Image</TabsTrigger>
                              <TabsTrigger value="text">Text Post</TabsTrigger>
                            </TabsList>
                          </Tabs>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your content title" {...field} />
                      </FormControl>
                      <div className="flex justify-between items-center mt-1">
                        <FormDescription>
                          {field.value.length}/60 characters
                        </FormDescription>
                        <div className="flex items-center">
                          <span className="mr-2">Score:</span>
                          <Badge variant={scoreTitle >= 70 ? "default" : scoreTitle >= 40 ? "outline" : "destructive"}>
                            {scoreTitle}%
                          </Badge>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your content description" 
                          {...field} 
                          className="h-24"
                        />
                      </FormControl>
                      <div className="flex justify-between items-center mt-1">
                        <FormDescription>
                          {field.value.length}/160 characters
                        </FormDescription>
                        <div className="flex items-center">
                          <span className="mr-2">Score:</span>
                          <Badge variant={scoreDescription >= 70 ? "default" : scoreDescription >= 40 ? "outline" : "destructive"}>
                            {scoreDescription}%
                          </Badge>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Keywords (comma separated)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="video editing, content creation, social media" 
                          {...field} 
                          className="h-20"
                        />
                      </FormControl>
                      <div className="flex justify-between items-center mt-1">
                        <FormDescription>
                          Add keywords relevant to your content
                        </FormDescription>
                        <div className="flex items-center">
                          <span className="mr-2">Score:</span>
                          <Badge variant={scoreKeywords >= 70 ? "default" : scoreKeywords >= 40 ? "outline" : "destructive"}>
                            {scoreKeywords}%
                          </Badge>
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button type="submit" className="w-full">Optimize Content</Button>
                </div>
              </form>
            </Form>
            
            {optimizedText && (
              <div className="mt-6 border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-lg">Optimized Content</h3>
                  <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <div className="bg-muted p-4 rounded whitespace-pre-wrap">{optimizedText}</div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Sidebar with tips and suggestions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Info className="h-5 w-5 mr-2" />
                SEO Score
              </CardTitle>
              <CardDescription>
                Your overall content optimization score
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <div className={`text-5xl font-bold ${
                  (scoreTitle + scoreDescription + scoreKeywords) / 3 >= 70 
                    ? "text-green-500"
                    : (scoreTitle + scoreDescription + scoreKeywords) / 3 >= 40
                    ? "text-amber-500"
                    : "text-red-500"
                }`}>
                  {Math.round((scoreTitle + scoreDescription + scoreKeywords) / 3)}%
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {(scoreTitle + scoreDescription + scoreKeywords) / 3 >= 70 
                    ? "Your content is well optimized!"
                    : (scoreTitle + scoreDescription + scoreKeywords) / 3 >= 40
                    ? "Your content needs some improvements"
                    : "Your content needs significant optimization"
                  }
                </p>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span>Title</span>
                  <Badge variant={scoreTitle >= 70 ? "default" : "outline"}>
                    {scoreTitle}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Description</span>
                  <Badge variant={scoreDescription >= 70 ? "default" : "outline"}>
                    {scoreDescription}%
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Keywords</span>
                  <Badge variant={scoreKeywords >= 70 ? "default" : "outline"}>
                    {scoreKeywords}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Optimization Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {suggestions.slice(0, 5).map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-1 text-primary" />
                    <span className="text-sm">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Check className="h-5 w-5 mr-2" />
                Suggested Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-primary/10">
                    #{tag}
                  </Badge>
                ))}
              </div>
              {suggestedTags.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Add keywords to get tag suggestions
                </p>
              )}
            </CardContent>
          </Card>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Best Practices</AlertTitle>
            <AlertDescription>
              Different platforms have different SEO requirements. Optimize your content specifically for each target platform for best results.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </PageContainer>
  );
}