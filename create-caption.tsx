import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer } from "@/components/layout/page-container";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Image, 
  MessageSquare, 
  Copy, 
  Check, 
  RefreshCcw, 
  Globe, 
  ThumbsUp,
  Instagram,
  Youtube,
  Hash
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

// Form schema for caption generation
const captionFormSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters").max(100, "Topic is too long"),
  mood: z.enum(["professional", "casual", "funny", "inspirational", "serious"]),
  platform: z.enum(["instagram", "tiktok", "youtube"]),
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(true),
  toneStrength: z.number().min(1).max(5),
  imageDescription: z.string().optional(),
  callToAction: z.enum(["none", "follow", "like", "comment", "share", "visit", "custom"]),
  customCta: z.string().optional(),
  language: z.enum(["english", "spanish", "french", "german", "portuguese", "japanese", "korean"]),
  captionLength: z.enum(["short", "medium", "long"]),
});

type CaptionFormValues = z.infer<typeof captionFormSchema>;

// Mood descriptions for the user interface
const moodDescriptions = {
  professional: "Formal tone suitable for business or educational content",
  casual: "Relaxed, conversational style for everyday content",
  funny: "Humorous and entertaining with jokes or wordplay",
  inspirational: "Motivational content with uplifting messages",
  serious: "Thoughtful, in-depth approach for important topics"
};

// Platform-specific details
const platformDetails = {
  instagram: {
    icon: <Instagram className="h-5 w-5" />,
    description: "Visual-first platform with carousel, reels, and stories",
    hashtagLimit: 30,
    captionLengthRecommendation: "Keep under 2,200 characters (about 300-500 words)"
  },
  tiktok: {
    icon: <SiTiktok className="h-5 w-5" />,
    description: "Short-form vertical videos with trending sounds",
    hashtagLimit: 5, 
    captionLengthRecommendation: "Keep short, around 100-150 characters"
  },
  youtube: {
    icon: <Youtube className="h-5 w-5" />,
    description: "Longer videos with detailed descriptions and timestamps",
    hashtagLimit: 15,
    captionLengthRecommendation: "Detailed descriptions up to 5,000 characters"
  }
};

// Caption length guide
const captionLengthGuide = {
  short: "50-100 characters (a brief sentence or two)",
  medium: "100-300 characters (a paragraph)",
  long: "300+ characters (multiple paragraphs)"
};

// Helper to generate random captions
const generateCaption = (data: CaptionFormValues): string => {
  // This would be replaced with an actual AI-powered API call in production
  
  // Start with greeting appropriate to platform and mood
  let caption = "";
  const emoji = data.includeEmojis ? getRandomEmojis(data.mood, 1) : "";
  
  // Add intro based on mood
  switch (data.mood) {
    case "professional":
      caption += `Today I'm sharing insights about ${data.topic}. ${emoji}\n\n`;
      break;
    case "casual":
      caption += `Hey guys! Check out this ${data.topic} content! ${emoji}\n\n`;
      break;
    case "funny":
      caption += `Who else struggles with ${data.topic}? This is too real! ${emoji}\n\n`;
      break;
    case "inspirational":
      caption += `Never give up on your ${data.topic} journey. Remember that every day is a new opportunity. ${emoji}\n\n`;
      break;
    case "serious":
      caption += `We need to address ${data.topic}. This is an important conversation. ${emoji}\n\n`;
      break;
  }
  
  // Add a middle section based on caption length
  if (data.captionLength === "medium" || data.captionLength === "long") {
    caption += `${data.topic} can transform the way you think about content creation. I've found that consistent practice makes a huge difference.\n\n`;
  }
  
  if (data.captionLength === "long") {
    caption += `One of the key insights I've discovered about ${data.topic} is that it requires both creativity and strategy. The most successful creators understand this balance.\n\n`;
  }
  
  // Add image description if provided
  if (data.imageDescription && data.imageDescription.trim() !== "") {
    caption += `📷 ${data.imageDescription}\n\n`;
  }
  
  // Add call to action
  switch (data.callToAction) {
    case "follow":
      caption += `Follow for more ${data.topic} content! ${data.includeEmojis ? "👉 " : ""}`;
      break;
    case "like":
      caption += `If you enjoyed this, hit that like button! ${data.includeEmojis ? "❤️ " : ""}`;
      break;
    case "comment":
      caption += `What are your thoughts on ${data.topic}? Share in the comments! ${data.includeEmojis ? "💬 " : ""}`;
      break;
    case "share":
      caption += `If you found this helpful, share with a friend who needs to see this! ${data.includeEmojis ? "🔄 " : ""}`;
      break;
    case "visit":
      caption += `Learn more at the link in bio! ${data.includeEmojis ? "🔗 " : ""}`;
      break;
    case "custom":
      if (data.customCta) {
        caption += `${data.customCta} ${data.includeEmojis ? "✨ " : ""}`;
      }
      break;
  }
  
  // Add hashtags based on topic if requested
  if (data.includeHashtags) {
    caption += "\n\n";
    const hashtags = generateHashtags(data.topic, data.platform);
    caption += hashtags;
  }
  
  return caption;
};

// Generate hashtags based on topic and platform
const generateHashtags = (topic: string, platform: string): string => {
  const baseHashtags = ["content", "creator", "socialmedia", "digital"];
  const topicWords = topic.toLowerCase().split(" ");
  
  // Generate hashtags based on the topic
  const topicHashtags = topicWords.map(word => {
    if (word.length < 3) return null;
    return word.replace(/[^a-zA-Z0-9]/g, "");
  }).filter(Boolean);
  
  // Platform-specific hashtags
  const platformHashtags: Record<string, string[]> = {
    instagram: ["instagram", "instagramreels", "instagramstories", "igdaily"],
    tiktok: ["tiktok", "tiktokviral", "fyp", "foryoupage"],
    youtube: ["youtube", "youtuber", "youtubechannel", "video"],
  };
  
  // Combine all hashtags
  const allHashtags = [
    ...topicHashtags,
    ...baseHashtags,
    ...(platformHashtags[platform] || [])
  ];
  
  // Limit number of hashtags based on platform
  let maxHashtags = 30; // Default for Instagram
  if (platform === "tiktok") maxHashtags = 5;
  if (platform === "youtube") maxHashtags = 15;
  
  // Shuffle and select limited number of hashtags
  const shuffled = allHashtags.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, maxHashtags);
  
  return selected.map(tag => `#${tag}`).join(" ");
};

// Get random emojis based on mood
const getRandomEmojis = (mood: string, count: number = 1): string => {
  const moodEmojis: Record<string, string[]> = {
    professional: ["💼", "📊", "📈", "🔍", "📱", "💻", "🤝", "📝"],
    casual: ["😊", "👋", "✌️", "🙌", "👍", "💕", "✨", "🎉"],
    funny: ["😂", "🤣", "😜", "🤪", "😆", "😅", "👻", "🙃"],
    inspirational: ["✨", "💫", "🌟", "🔥", "💪", "🙏", "❤️", "🌈"],
    serious: ["📢", "❗", "⚠️", "🔴", "📌", "🧐", "🤔", "💭"],
  };
  
  const emojisForMood = moodEmojis[mood] || moodEmojis.casual;
  let result = "";
  
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * emojisForMood.length);
    result += emojisForMood[randomIndex];
  }
  
  return result;
};

export default function CreateCaption() {
  const [generatedCaptions, setGeneratedCaptions] = useState<string[]>([]);
  const [currentCaption, setCurrentCaption] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Form setup
  const form = useForm<CaptionFormValues>({
    resolver: zodResolver(captionFormSchema),
    defaultValues: {
      topic: "",
      mood: "casual",
      platform: "instagram",
      includeHashtags: true,
      includeEmojis: true,
      toneStrength: 3,
      imageDescription: "",
      callToAction: "none",
      customCta: "",
      language: "english",
      captionLength: "medium",
    },
  });

  // Generate multiple captions based on form data
  const onSubmit = (data: CaptionFormValues) => {
    // In a real application, this would call an API to generate captions
    const captions: string[] = [];
    
    // Generate 3 variations
    for (let i = 0; i < 3; i++) {
      captions.push(generateCaption(data));
    }
    
    setGeneratedCaptions(captions);
    setCurrentCaption(captions[0]);
    
    toast({
      title: "Captions Generated",
      description: "We've created some caption options for your content.",
    });
  };

  // Copy caption to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentCaption);
    setCopied(true);
    
    toast({
      title: "Copied to clipboard",
      description: "The caption has been copied to your clipboard.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };

  // Regenerate a new set of captions
  const regenerateCaptions = () => {
    onSubmit(form.getValues());
  };

  // Select a caption from the generated options
  const selectCaption = (caption: string) => {
    setCurrentCaption(caption);
  };

  return (
    <PageContainer>
      <Header title="Create Caption" />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Caption form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Caption Generator
            </CardTitle>
            <CardDescription>
              Create engaging captions for your social media posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Topic/Theme</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Fitness, Travel, Video Editing Tips" {...field} />
                      </FormControl>
                      <FormDescription>
                        What is your content about?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Platform</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="instagram" id="instagram" />
                              <label htmlFor="instagram" className="flex items-center cursor-pointer">
                                <Instagram className="h-4 w-4 mr-2" />
                                Instagram
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="tiktok" id="tiktok" />
                              <label htmlFor="tiktok" className="flex items-center cursor-pointer">
                                <SiTiktok className="h-4 w-4 mr-2" />
                                TikTok
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="youtube" id="youtube" />
                              <label htmlFor="youtube" className="flex items-center cursor-pointer">
                                <Youtube className="h-4 w-4 mr-2" />
                                YouTube
                              </label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          {form.watch("platform") && platformDetails[form.watch("platform")].description}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption Mood/Tone</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="professional" id="professional" />
                              <label htmlFor="professional" className="cursor-pointer">Professional</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="casual" id="casual" />
                              <label htmlFor="casual" className="cursor-pointer">Casual</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="funny" id="funny" />
                              <label htmlFor="funny" className="cursor-pointer">Funny</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="inspirational" id="inspirational" />
                              <label htmlFor="inspirational" className="cursor-pointer">Inspirational</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="serious" id="serious" />
                              <label htmlFor="serious" className="cursor-pointer">Serious</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          {form.watch("mood") && moodDescriptions[form.watch("mood")]}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="imageDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the image or video you're posting" 
                          {...field} 
                          className="h-20"
                        />
                      </FormControl>
                      <FormDescription>
                        Adds context to your caption about the visual
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="captionLength"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Caption Length</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="short" id="short" />
                              <label htmlFor="short" className="cursor-pointer">Short</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="medium" id="medium" />
                              <label htmlFor="medium" className="cursor-pointer">Medium</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="long" id="long" />
                              <label htmlFor="long" className="cursor-pointer">Long</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          {form.watch("captionLength") && captionLengthGuide[form.watch("captionLength")]}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="callToAction"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Call to Action</FormLabel>
                        <FormControl>
                          <RadioGroup 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="none" id="none" />
                              <label htmlFor="none" className="cursor-pointer">None</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="follow" id="follow" />
                              <label htmlFor="follow" className="cursor-pointer">Follow</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="like" id="like" />
                              <label htmlFor="like" className="cursor-pointer">Like</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="comment" id="comment" />
                              <label htmlFor="comment" className="cursor-pointer">Comment</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="share" id="share" />
                              <label htmlFor="share" className="cursor-pointer">Share</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="visit" id="visit" />
                              <label htmlFor="visit" className="cursor-pointer">Visit Link</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="custom" id="custom" />
                              <label htmlFor="custom" className="cursor-pointer">Custom</label>
                            </div>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {form.watch("callToAction") === "custom" && (
                  <FormField
                    control={form.control}
                    name="customCta"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Custom Call to Action</FormLabel>
                        <FormControl>
                          <Input placeholder="E.g., Join our challenge today!" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="includeHashtags"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center">
                            <Hash className="h-4 w-4 mr-2" />
                            Include Hashtags
                          </FormLabel>
                          <FormDescription>
                            Add relevant hashtags to your post
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="includeEmojis"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Include Emojis
                          </FormLabel>
                          <FormDescription>
                            Add relevant emojis to your caption
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="toneStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tone Strength</FormLabel>
                      <FormControl>
                        <div className="pt-2">
                          <Slider
                            min={1}
                            max={5}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(vals) => field.onChange(vals[0])}
                            className="w-full"
                          />
                        </div>
                      </FormControl>
                      <div className="flex justify-between mt-1">
                        <FormDescription>Subtle</FormDescription>
                        <FormDescription>
                          {field.value === 1 && "Very Subtle"}
                          {field.value === 2 && "Subtle"}
                          {field.value === 3 && "Balanced"}
                          {field.value === 4 && "Strong"}
                          {field.value === 5 && "Very Strong"}
                        </FormDescription>
                        <FormDescription>Strong</FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Globe className="h-4 w-4 mr-2" />
                        Language
                      </FormLabel>
                      <FormControl>
                        <RadioGroup 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          className="flex flex-wrap gap-2"
                        >
                          <div className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <RadioGroupItem value="english" id="english" />
                            <label htmlFor="english" className="cursor-pointer">English</label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <RadioGroupItem value="spanish" id="spanish" />
                            <label htmlFor="spanish" className="cursor-pointer">Spanish</label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <RadioGroupItem value="french" id="french" />
                            <label htmlFor="french" className="cursor-pointer">French</label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <RadioGroupItem value="german" id="german" />
                            <label htmlFor="german" className="cursor-pointer">German</label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <RadioGroupItem value="portuguese" id="portuguese" />
                            <label htmlFor="portuguese" className="cursor-pointer">Portuguese</label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <RadioGroupItem value="japanese" id="japanese" />
                            <label htmlFor="japanese" className="cursor-pointer">Japanese</label>
                          </div>
                          <div className="flex items-center space-x-2 border rounded-md px-3 py-1">
                            <RadioGroupItem value="korean" id="korean" />
                            <label htmlFor="korean" className="cursor-pointer">Korean</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4">
                  <Button type="submit" className="w-full">Generate Captions</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
        
        {/* Generated captions and preview */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Generated Captions
            </CardTitle>
            <CardDescription>
              Choose and customize your perfect caption
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            {currentCaption ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {form.watch("platform")}
                      </Badge>
                      <Badge variant="secondary">
                        {form.watch("mood")}
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="bg-muted p-4 rounded-md max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                    {currentCaption}
                  </div>
                  
                  {generatedCaptions.length > 1 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Alternate Options:</h4>
                      <div className="space-y-2">
                        {generatedCaptions.map((caption, index) => (
                          <Button
                            key={index}
                            variant={currentCaption === caption ? "default" : "outline"}
                            className="mr-2 mb-2"
                            onClick={() => selectCaption(caption)}
                          >
                            Option {index + 1}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={regenerateCaptions}
                    className="w-full"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Regenerate Options
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full space-y-4 py-12 text-center">
                <Image className="h-16 w-16 text-muted-foreground" />
                <h3 className="font-medium text-lg">No Captions Generated Yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Fill in the form and click "Generate Captions" to create social media post content
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Alert className="w-full">
              <ThumbsUp className="h-4 w-4" />
              <AlertTitle>Pro Tip</AlertTitle>
              <AlertDescription className="text-xs">
                Different platforms have different optimal caption lengths. Instagram allows up to 2,200 characters, while TikTok works best with very brief captions.
              </AlertDescription>
            </Alert>
          </CardFooter>
        </Card>
      </div>
    </PageContainer>
  );
}