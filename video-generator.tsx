import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertVideoSchema } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { VideoPreview } from "@/components/videos/video-preview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define platform options
const platformOptions = [
  { id: "youtube", label: "YouTube" },
  { id: "instagram", label: "Instagram" },
  { id: "tiktok", label: "TikTok" },
];

// Define style options
const styleOptions = [
  { id: "cinematic", label: "Cinematic" },
  { id: "animated", label: "Animated" },
  { id: "professional", label: "Professional" },
  { id: "energetic", label: "Energetic" },
  { id: "minimalist", label: "Minimalist" },
  { id: "custom", label: "Custom" },
];

// Define duration options
const durationOptions = [
  { value: "15 seconds", label: "15 seconds" },
  { value: "30 seconds", label: "30 seconds" },
  { value: "60 seconds", label: "60 seconds" },
  { value: "90 seconds", label: "90 seconds" },
  { value: "Custom", label: "Custom" },
];

// Define aspect ratio options
const aspectRatioOptions = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:5", label: "4:5 (Instagram)" },
];

// Extend the schema with validation
const formSchema = insertVideoSchema.extend({
  title: z.string().min(3, "Title must be at least 3 characters"),
});

export function VideoGenerator() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      prompt: "",
      style: "cinematic",
      duration: "30 seconds",
      aspectRatio: "16:9",
      platforms: ["youtube"],
      status: "draft",
      userId: 1, // Default user ID for demo
    },
  });

  // Handle video generation
  const generateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      setGeneratingPreview(true);
      const response = await apiRequest("POST", "/api/generate-video", values);
      return response.json();
    },
    onSuccess: (data) => {
      setPreviewData(data);
      setGeneratingPreview(false);
      toast({
        title: "Preview Generated",
        description: "Your video preview has been generated successfully!",
      });
    },
    onError: () => {
      setGeneratingPreview(false);
      toast({
        title: "Generation Failed",
        description: "Failed to generate video preview. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle video save
  const saveMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/videos", values);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Video Saved",
        description: "Your video has been saved successfully!",
      });
      form.reset();
      setPreviewData(null);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save video. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onGenerateVideo = (values: z.infer<typeof formSchema>) => {
    generateMutation.mutate(values);
  };

  const onSaveVideo = (values: z.infer<typeof formSchema>) => {
    saveMutation.mutate(values);
  };

  return (
    <Card className="rounded-xl">
      <CardHeader>
        <CardTitle>Generate New Video</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form Side */}
          <div className="space-y-6">
            <Form {...form}>
              <form className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter a title for your video" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Prompt</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the video you want to create. Be specific about the style, content, and tone."
                          className="h-40 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video Style</FormLabel>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {styleOptions.map((style) => (
                          <FormItem key={style.id} className="flex flex-col">
                            <FormLabel className="relative block p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-center text-sm cursor-pointer hover:bg-primary/5 peer-checked:border-primary peer-checked:bg-primary/5 dark:peer-checked:bg-primary/20">
                              <FormControl>
                                <input
                                  type="radio"
                                  className="peer absolute opacity-0"
                                  checked={field.value === style.id}
                                  onChange={() => field.onChange(style.id)}
                                />
                              </FormControl>
                              {style.label}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select duration" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {durationOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="aspectRatio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aspect Ratio</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select aspect ratio" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {aspectRatioOptions.map(option => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="platforms"
                  render={() => (
                    <FormItem>
                      <FormLabel>Platforms</FormLabel>
                      <div className="flex flex-wrap gap-4">
                        {platformOptions.map((platform) => (
                          <FormField
                            key={platform.id}
                            control={form.control}
                            name="platforms"
                            render={({ field }) => {
                              return (
                                <FormItem key={platform.id} className="flex items-center space-x-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(platform.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, platform.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== platform.id
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal cursor-pointer">
                                    {platform.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center justify-end space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => onSaveVideo(form.getValues())} 
                    disabled={saveMutation.isPending}
                  >
                    {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Draft
                  </Button>
                  <Button 
                    type="button" 
                    className="bg-gradient-to-r from-primary to-[#EC4899] hover:opacity-90"
                    onClick={() => onGenerateVideo(form.getValues())}
                    disabled={generateMutation.isPending || generatingPreview}
                  >
                    {(generateMutation.isPending || generatingPreview) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Video
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          
          {/* Preview Side */}
          <VideoPreview 
            isGenerating={generatingPreview} 
            previewData={previewData}
            selectedPlatforms={form.watch("platforms")}
          />
        </div>
      </CardContent>
    </Card>
  );
}
