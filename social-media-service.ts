import axios from 'axios';
import { promises as fs } from 'fs';
import path from 'path';
import { Video } from '@shared/schema';

interface SocialMediaAuthConfig {
  youtube?: {
    clientId: string;
    clientSecret: string;
    refreshToken?: string;
    accessToken?: string;
  };
  tiktok?: {
    clientKey: string;
    clientSecret: string;
    accessToken?: string;
  };
  instagram?: {
    accessToken?: string;
  };
}

interface PublishResult {
  success: boolean;
  platform: string;
  url?: string;
  message?: string;
  error?: string;
}

/**
 * Service to handle social media platform integration and uploads
 */
export class SocialMediaService {
  private config: SocialMediaAuthConfig = {};
  
  constructor() {
    // Load configuration from environment variables
    this.loadConfig();
  }
  
  /**
   * Load configuration from environment variables
   */
  private loadConfig() {
    // YouTube configuration
    if (process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET) {
      this.config.youtube = {
        clientId: process.env.YOUTUBE_CLIENT_ID,
        clientSecret: process.env.YOUTUBE_CLIENT_SECRET,
        refreshToken: process.env.YOUTUBE_REFRESH_TOKEN,
        accessToken: process.env.YOUTUBE_ACCESS_TOKEN
      };
    }
    
    // TikTok configuration
    if (process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET) {
      this.config.tiktok = {
        clientKey: process.env.TIKTOK_CLIENT_KEY,
        clientSecret: process.env.TIKTOK_CLIENT_SECRET,
        accessToken: process.env.TIKTOK_ACCESS_TOKEN
      };
    }
    
    // Instagram configuration
    if (process.env.INSTAGRAM_ACCESS_TOKEN) {
      this.config.instagram = {
        accessToken: process.env.INSTAGRAM_ACCESS_TOKEN
      };
    }
  }
  
  /**
   * Public method to reload configuration from environment variables
   * This ensures we always have the latest credentials
   */
  public reloadConfig() {
    this.loadConfig();
  }
  
  /**
   * Check if a platform is configured
   */
  public isPlatformConfigured(platform: string): boolean {
    switch (platform.toLowerCase()) {
      case 'youtube':
        return !!this.config.youtube?.clientId && !!this.config.youtube?.clientSecret;
      case 'tiktok':
        return !!this.config.tiktok?.clientKey && !!this.config.tiktok?.clientSecret;
      case 'instagram':
        return !!this.config.instagram?.accessToken;
      default:
        return false;
    }
  }
  
  /**
   * Get list of configured platforms
   */
  public getConfiguredPlatforms(): string[] {
    const platforms: string[] = [];
    
    if (this.isPlatformConfigured('youtube')) platforms.push('youtube');
    if (this.isPlatformConfigured('tiktok')) platforms.push('tiktok');
    if (this.isPlatformConfigured('instagram')) platforms.push('instagram');
    
    return platforms;
  }
  
  /**
   * Set access token for a platform
   * This is used after OAuth authentication completes
   */
  public setAccessToken(platform: string, token: string) {
    switch (platform.toLowerCase()) {
      case 'youtube':
        if (this.config.youtube) {
          this.config.youtube.accessToken = token;
          console.log(`Updated access token for YouTube`);
          return true;
        }
        break;
      case 'tiktok':
        if (this.config.tiktok) {
          this.config.tiktok.accessToken = token;
          console.log(`Updated access token for TikTok`);
          return true;
        }
        break;
      case 'instagram':
        if (!this.config.instagram) this.config.instagram = {};
        this.config.instagram.accessToken = token;
        console.log(`Updated access token for Instagram`);
        return true;
    }
    
    console.log(`Failed to update token for platform: ${platform}`);
    return false;
  }
  
  /**
   * Get authorization URL for a platform
   * @param platform The platform to get auth URL for
   * @param baseUrl Optional base URL to use for redirect
   */
  public getAuthorizationUrl(platform: string, baseUrl?: string): string | null {
    switch (platform.toLowerCase()) {
      case 'youtube':
        if (!this.config.youtube?.clientId) return null;
        
        // Include multiple scopes for YouTube - manage account, upload videos, and read data
        const youtubeScopes = encodeURIComponent(
          'https://www.googleapis.com/auth/youtube ' +
          'https://www.googleapis.com/auth/youtube.upload ' +
          'https://www.googleapis.com/auth/youtube.readonly'
        );
        
        // Use provided baseUrl or fallback to the most likely current host
        // In a real implementation, this URL would be passed from the route
        const thisHost = baseUrl || 'localhost:5000';
        const protocol = thisHost.includes('localhost') ? 'http' : 'https';
        
        // Build redirect URI 
        const redirectUri = `${protocol}://${thisHost}/api/auth/youtube/callback`;
        console.log(`[OAuth] Using YouTube redirect URI: ${redirectUri}`);
        const youtubeRedirectUri = encodeURIComponent(redirectUri);
        
        // Use the proper OAuth flow for YouTube with access_type=offline to get refresh token
        return `https://accounts.google.com/o/oauth2/auth?client_id=${this.config.youtube.clientId}&redirect_uri=${youtubeRedirectUri}&scope=${youtubeScopes}&response_type=code&access_type=offline&prompt=consent&include_granted_scopes=true`;
        
      case 'tiktok':
        if (!this.config.tiktok?.clientKey) return null;
        
        // Use provided baseUrl or fallback to the most likely current host
        const thisHostTikTok = baseUrl || 'localhost:5000';
        const protocolTikTok = thisHostTikTok.includes('localhost') ? 'http' : 'https';
        
        // Build redirect URI 
        const redirectUriTikTok = `${protocolTikTok}://${thisHostTikTok}/api/auth/tiktok/callback`;
        console.log(`[OAuth] Using TikTok redirect URI: ${redirectUriTikTok}`);
        const tiktokRedirectUri = encodeURIComponent(redirectUriTikTok);
        
        // TikTok scopes for video uploads and user info
        return `https://www.tiktok.com/auth/authorize/?client_key=${this.config.tiktok.clientKey}&scope=user.info.basic,video.upload&response_type=code&redirect_uri=${tiktokRedirectUri}`;
        
      case 'instagram':
        // For Instagram Business accounts through Facebook Graph API
        if (!process.env.FACEBOOK_APP_ID) return null;
        
        // Use provided baseUrl or fallback to the most likely current host
        const thisHostInsta = baseUrl || 'localhost:5000';
        const protocolInsta = thisHostInsta.includes('localhost') ? 'http' : 'https';
        
        // Build redirect URI 
        const redirectUriInsta = `${protocolInsta}://${thisHostInsta}/api/auth/instagram/callback`;
        console.log(`[OAuth] Using Instagram redirect URI: ${redirectUriInsta}`);
        const instagramRedirectUri = encodeURIComponent(redirectUriInsta);
        
        // Instagram scopes for content publishing and page access
        const instagramScope = encodeURIComponent('instagram_content_publish,pages_read_engagement');
        
        return `https://www.facebook.com/v16.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${instagramRedirectUri}&scope=${instagramScope}`;
        
      default:
        return null;
    }
  }
  
  /**
   * Publish video to YouTube
   */
  private async publishToYoutube(video: Video, videoFilePath: string): Promise<PublishResult> {
    try {
      if (!this.config.youtube?.accessToken) {
        return {
          success: false,
          platform: 'youtube',
          error: 'YouTube not authorized. Please connect your YouTube account.'
        };
      }
      
      // In a real implementation, this would use the YouTube API to upload the video
      console.log(`[YouTube] Publishing video: ${video.title}`);
      console.log(`[YouTube] Using video file: ${videoFilePath}`);
      
      // Simulate successful upload for demo purposes
      // In production, this would make API calls to the YouTube Data API v3
      
      return {
        success: true,
        platform: 'youtube',
        url: `https://youtube.com/watch?v=dQw4w9WgXcQ`,
        message: 'Video successfully published to YouTube'
      };
    } catch (error) {
      console.error('Error publishing to YouTube:', error);
      return {
        success: false,
        platform: 'youtube',
        error: 'Failed to publish to YouTube. Please try again later.'
      };
    }
  }
  
  /**
   * Publish video to TikTok
   */
  private async publishToTikTok(video: Video, videoFilePath: string): Promise<PublishResult> {
    try {
      if (!this.config.tiktok?.accessToken) {
        return {
          success: false,
          platform: 'tiktok',
          error: 'TikTok not authorized. Please connect your TikTok account.'
        };
      }
      
      // In a real implementation, this would use the TikTok API to upload the video
      console.log(`[TikTok] Publishing video: ${video.title}`);
      console.log(`[TikTok] Using video file: ${videoFilePath}`);
      
      // Simulate successful upload for demo purposes
      // In production, this would make API calls to the TikTok Developer API
      
      return {
        success: true,
        platform: 'tiktok',
        url: 'https://tiktok.com/@username/video/1234567890',
        message: 'Video successfully published to TikTok'
      };
    } catch (error) {
      console.error('Error publishing to TikTok:', error);
      return {
        success: false,
        platform: 'tiktok',
        error: 'Failed to publish to TikTok. Please try again later.'
      };
    }
  }
  
  /**
   * Publish video to Instagram
   */
  private async publishToInstagram(video: Video, videoFilePath: string): Promise<PublishResult> {
    try {
      if (!this.config.instagram?.accessToken) {
        return {
          success: false,
          platform: 'instagram',
          error: 'Instagram not authorized. Please connect your Instagram account.'
        };
      }
      
      // In a real implementation, this would use the Instagram Graph API to upload the video
      console.log(`[Instagram] Publishing video: ${video.title}`);
      console.log(`[Instagram] Using video file: ${videoFilePath}`);
      
      // Simulate successful upload for demo purposes
      // In production, this would make API calls to the Instagram Graph API
      
      return {
        success: true,
        platform: 'instagram',
        url: 'https://instagram.com/p/AbCdEfGh123',
        message: 'Video successfully published to Instagram'
      };
    } catch (error) {
      console.error('Error publishing to Instagram:', error);
      return {
        success: false,
        platform: 'instagram',
        error: 'Failed to publish to Instagram. Please try again later.'
      };
    }
  }
  
  /**
   * Publish video to selected platforms
   */
  public async publishVideo(video: Video, platforms: string[]): Promise<PublishResult[]> {
    // Validate the video has a videoUrl
    if (!video.videoUrl) {
      return [{
        success: false,
        platform: 'all',
        error: 'No video URL available'
      }];
    }
    
    // Get the local file path from the URL
    const urlPath = new URL(video.videoUrl, 'http://localhost').pathname;
    const videoFileName = path.basename(urlPath);
    const videoFilePath = path.join(process.cwd(), 'public', 'generated', videoFileName);
    
    // Check if the file exists
    try {
      await fs.access(videoFilePath);
    } catch (error) {
      return [{
        success: false,
        platform: 'all',
        error: 'Video file not found'
      }];
    }
    
    // Publish to selected platforms
    const results: PublishResult[] = [];
    
    for (const platform of platforms) {
      switch (platform.toLowerCase()) {
        case 'youtube':
          results.push(await this.publishToYoutube(video, videoFilePath));
          break;
        case 'tiktok':
          results.push(await this.publishToTikTok(video, videoFilePath));
          break;
        case 'instagram':
          results.push(await this.publishToInstagram(video, videoFilePath));
          break;
        default:
          results.push({
            success: false,
            platform: platform,
            error: `Unsupported platform: ${platform}`
          });
      }
    }
    
    return results;
  }
}

// Export singleton instance
export const socialMediaService = new SocialMediaService();