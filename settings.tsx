import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PageContainer } from "@/components/layout/page-container";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  PaintBucket, 
  Moon, 
  Sun, 
  Palette,
  Key,
  RefreshCw,
  Eye,
  EyeOff,
  Check,
  Youtube,
  Instagram
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { askForSecrets } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";

// Form schema for user settings
const profileFormSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  displayName: z.string().optional(),
  bio: z.string().max(160, "Bio must be 160 characters or less").optional(),
});

// Form schema for appearance settings
const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
  accentColor: z.string(),
  animationsEnabled: z.boolean().default(true),
  interfaceDensity: z.number().min(1).max(3),
});

// Form schema for notification settings
const notificationFormSchema = z.object({
  emailNotifications: z.boolean().default(true),
  pushNotifications: z.boolean().default(true),
  publishAlerts: z.boolean().default(true),
  analyticsUpdates: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

// API settings schema
const apiSettingsSchema = z.object({
  youtubeConnected: z.boolean().default(false),
  tiktokConnected: z.boolean().default(false),
  instagramConnected: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;
type NotificationFormValues = z.infer<typeof notificationFormSchema>;
type ApiSettingsValues = z.infer<typeof apiSettingsSchema>;

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [secretsStatus, setSecretsStatus] = useState({
    youtube: false,
    tiktok: false,
    instagram: false
  });
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  // Form setups
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "creator_user",
      email: "user@example.com",
      displayName: "Content Creator",
      bio: "I create amazing videos with AI technology",
    },
  });

  const appearanceForm = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceFormSchema),
    defaultValues: {
      theme: "system",
      accentColor: "#6366F1",
      animationsEnabled: true,
      interfaceDensity: 2,
    },
  });

  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: true,
      publishAlerts: true,
      analyticsUpdates: true,
      marketingEmails: false,
    },
  });

  const apiSettingsForm = useForm<ApiSettingsValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      youtubeConnected: false,
      tiktokConnected: false,
      instagramConnected: false,
    },
  });

  // Check for existing API secrets on component mount
  const checkSecrets = async () => {
    setIsChecking(true);
    try {
      const response = await apiRequest({
        url: '/api/check-secrets',
        method: 'POST',
        body: {
          platforms: ['youtube', 'tiktok', 'instagram']
        }
      }, true);
      
      if (response.ok) {
        const data = await response.json();
        setSecretsStatus({
          youtube: data.youtube || false,
          tiktok: data.tiktok || false,
          instagram: data.instagram || false
        });
      }
    } catch (error) {
      console.error("Error checking API secrets:", error);
    } finally {
      setIsChecking(false);
    }
  };

  // Form submission handlers
  const onProfileSubmit = (data: ProfileFormValues) => {
    console.log("Profile data submitted:", data);
    
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved.",
    });
  };

  const onAppearanceSubmit = (data: AppearanceFormValues) => {
    console.log("Appearance settings submitted:", data);
    
    toast({
      title: "Appearance settings updated",
      description: "Your appearance preferences have been saved.",
    });
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    console.log("Notification settings submitted:", data);
    
    toast({
      title: "Notification settings updated",
      description: "Your notification preferences have been saved.",
    });
  };

  // Connect to platform
  const connectToPlatform = async (platform: string) => {
    try {
      let secretKeys: string[] = [];
      let userMessage = "";
      
      switch (platform) {
        case "youtube":
          secretKeys = ["YOUTUBE_CLIENT_ID", "YOUTUBE_CLIENT_SECRET"];
          userMessage = "To connect to YouTube, we need your API credentials. These will be used to authorize your account for video uploads.";
          break;
        case "tiktok":
          secretKeys = ["TIKTOK_CLIENT_KEY", "TIKTOK_CLIENT_SECRET"];
          userMessage = "To connect to TikTok, we need your API credentials. These will be used to authorize your account for video uploads.";
          break;
        case "instagram":
          secretKeys = ["INSTAGRAM_ACCESS_TOKEN"];
          userMessage = "To connect to Instagram, we need your API credentials. These will be used to authorize your account for video uploads.";
          break;
      }
      
      // Use the utility to ask for secrets
      await askForSecrets(platform);
      
      // Check if the secrets were added
      await checkSecrets();
      
      toast({
        title: `Connected to ${platform}`,
        description: `Your ${platform} account has been successfully connected.`,
      });
    } catch (error) {
      console.error(`Error connecting to ${platform}:`, error);
      
      toast({
        title: `Connection failed`,
        description: `Unable to connect to ${platform}. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <PageContainer>
      <Header title="Settings" />
      
      <div className="p-6">
        <Tabs 
          defaultValue="profile" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-4 w-full max-w-md">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="connections">API Connections</TabsTrigger>
          </TabsList>
          
          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Profile Settings</span>
                </CardTitle>
                <CardDescription>
                  Manage your personal information and account details
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                          CC
                        </div>
                        <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 p-0">
                          <PaintBucket className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={profileForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="username" {...field} />
                            </FormControl>
                            <FormDescription>
                              Your unique username on VIDIYOME
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@example.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              Used for notifications and account recovery
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your Name" {...field} />
                          </FormControl>
                          <FormDescription>
                            How your name appears to others
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={profileForm.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Input placeholder="A short description about yourself" {...field} />
                          </FormControl>
                          <FormDescription>
                            {field.value?.length || 0}/160 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Save Profile Changes</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Security</span>
                </CardTitle>
                <CardDescription>
                  Manage your password and account security settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password</h4>
                      <p className="text-sm text-muted-foreground">
                        Last changed 3 months ago
                      </p>
                    </div>
                    <Button variant="outline">Change Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Connected Devices</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage devices that are logged into your account
                      </p>
                    </div>
                    <Button variant="outline">Manage Devices</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Palette className="h-5 w-5" />
                  <span>Appearance Settings</span>
                </CardTitle>
                <CardDescription>
                  Customize how VIDIYOME looks and feels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...appearanceForm}>
                  <form onSubmit={appearanceForm.handleSubmit(onAppearanceSubmit)} className="space-y-6">
                    <FormField
                      control={appearanceForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <div className="flex flex-col space-y-3">
                            <FormControl>
                              <div className="grid grid-cols-3 gap-4">
                                <div
                                  className={`flex flex-col items-center border rounded-md p-4 cursor-pointer ${
                                    field.value === "light" ? "border-primary bg-primary/5" : ""
                                  }`}
                                  onClick={() => field.onChange("light")}
                                >
                                  <Sun className="h-6 w-6 mb-2" />
                                  <span className="text-sm">Light</span>
                                </div>
                                <div
                                  className={`flex flex-col items-center border rounded-md p-4 cursor-pointer ${
                                    field.value === "dark" ? "border-primary bg-primary/5" : ""
                                  }`}
                                  onClick={() => field.onChange("dark")}
                                >
                                  <Moon className="h-6 w-6 mb-2" />
                                  <span className="text-sm">Dark</span>
                                </div>
                                <div
                                  className={`flex flex-col items-center border rounded-md p-4 cursor-pointer ${
                                    field.value === "system" ? "border-primary bg-primary/5" : ""
                                  }`}
                                  onClick={() => field.onChange("system")}
                                >
                                  <div className="flex h-6 mb-2">
                                    <Sun className="h-6 w-6" />
                                    <span className="mx-1">/</span>
                                    <Moon className="h-6 w-6" />
                                  </div>
                                  <span className="text-sm">System</span>
                                </div>
                              </div>
                            </FormControl>
                            <FormDescription>
                              Choose between light, dark, or system theme
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={appearanceForm.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <FormControl>
                            <div className="flex items-center space-x-3">
                              <div
                                className="h-10 w-10 rounded-full border"
                                style={{ backgroundColor: field.value }}
                              />
                              <Input
                                type="color"
                                {...field}
                                className="w-20 h-10"
                              />
                              <Input
                                value={field.value}
                                onChange={field.onChange}
                                className="flex-grow"
                              />
                            </div>
                          </FormControl>
                          <FormDescription>
                            The main color used throughout the interface
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={appearanceForm.control}
                      name="animationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between space-x-4 rounded-lg border p-4">
                          <div>
                            <FormLabel className="text-base">Enable Animations</FormLabel>
                            <FormDescription>
                              Show animations and transitions throughout the interface
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={appearanceForm.control}
                      name="interfaceDensity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interface Density</FormLabel>
                          <FormControl>
                            <div className="pt-2">
                              <Slider
                                min={1}
                                max={3}
                                step={1}
                                defaultValue={[field.value]}
                                onValueChange={(vals) => field.onChange(vals[0])}
                                className="w-full"
                              />
                            </div>
                          </FormControl>
                          <div className="flex justify-between mt-1">
                            <FormDescription>Compact</FormDescription>
                            <FormDescription>
                              {field.value === 1 && "Compact"}
                              {field.value === 2 && "Comfortable"}
                              {field.value === 3 && "Spacious"}
                            </FormDescription>
                            <FormDescription>Spacious</FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">Save Appearance Settings</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notification Settings</span>
                </CardTitle>
                <CardDescription>
                  Control how and when VIDIYOME notifies you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-4 rounded-lg border p-4">
                            <div className="flex-1">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive important updates and information via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="pushNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-4 rounded-lg border p-4">
                            <div className="flex-1">
                              <FormLabel className="text-base">Push Notifications</FormLabel>
                              <FormDescription>
                                Get real-time alerts in your browser or mobile device
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="publishAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-4 rounded-lg border p-4">
                            <div className="flex-1">
                              <FormLabel className="text-base">Publishing Alerts</FormLabel>
                              <FormDescription>
                                Get notified when your content is published or fails to publish
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="analyticsUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-4 rounded-lg border p-4">
                            <div className="flex-1">
                              <FormLabel className="text-base">Analytics Updates</FormLabel>
                              <FormDescription>
                                Receive performance reports and analytics insights
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="marketingEmails"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-4 rounded-lg border p-4">
                            <div className="flex-1">
                              <FormLabel className="text-base">Marketing Emails</FormLabel>
                              <FormDescription>
                                Get product updates, offers, and promotional content
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button type="submit">Save Notification Settings</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* API Connections */}
          <TabsContent value="connections" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Social Media Connections</span>
                </CardTitle>
                <CardDescription>
                  Connect your social media accounts for seamless publishing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={checkSecrets}
                      disabled={isChecking}
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isChecking ? 'animate-spin' : ''}`} />
                      Refresh Connection Status
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* YouTube Connection */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 flex items-center justify-center bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full">
                          <Youtube className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">YouTube</h4>
                          <p className="text-sm text-muted-foreground">
                            {secretsStatus.youtube 
                              ? "Connected and authorized" 
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant={secretsStatus.youtube ? "outline" : "default"}
                        onClick={() => connectToPlatform("youtube")}
                      >
                        {secretsStatus.youtube ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Connected
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                    
                    {/* TikTok Connection */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 flex items-center justify-center bg-black/10 dark:bg-white/10 text-black dark:text-white rounded-full">
                          <SiTiktok className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">TikTok</h4>
                          <p className="text-sm text-muted-foreground">
                            {secretsStatus.tiktok 
                              ? "Connected and authorized" 
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant={secretsStatus.tiktok ? "outline" : "default"}
                        onClick={() => connectToPlatform("tiktok")}
                      >
                        {secretsStatus.tiktok ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Connected
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                    
                    {/* Instagram Connection */}
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 flex items-center justify-center bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">
                          <Instagram className="h-6 w-6" />
                        </div>
                        <div>
                          <h4 className="font-medium">Instagram</h4>
                          <p className="text-sm text-muted-foreground">
                            {secretsStatus.instagram 
                              ? "Connected and authorized" 
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant={secretsStatus.instagram ? "outline" : "default"}
                        onClick={() => connectToPlatform("instagram")}
                      >
                        {secretsStatus.instagram ? (
                          <>
                            <Check className="h-4 w-4 mr-2" />
                            Connected
                          </>
                        ) : (
                          "Connect"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6">
                <Alert className="w-full">
                  <Key className="h-4 w-4" />
                  <AlertTitle>API Keys Security</AlertTitle>
                  <AlertDescription>
                    Your API keys and secrets are securely stored and encrypted. We never share your credentials with third parties.
                  </AlertDescription>
                </Alert>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>Developer Settings</span>
                </CardTitle>
                <CardDescription>
                  Access to VIDIYOME API and developer tools
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">API Access</h4>
                      <p className="text-sm text-muted-foreground">
                        Enable API access for third-party integrations
                      </p>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-medium mb-2">API Key</h4>
                    <div className="flex items-center space-x-2">
                      <Input type="password" value="••••••••••••••••••••••" readOnly />
                      <Button variant="outline" size="icon">
                        <EyeOff className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Last used: Never
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <Button variant="outline">Generate New Key</Button>
                    <Button variant="outline">View Documentation</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}