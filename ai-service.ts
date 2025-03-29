import { InsertVideo } from "@shared/schema";
import { promises as fs } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { createCanvas } from "canvas";
import { exec } from "child_process";
import { promisify } from "util";

const execPromise = promisify(exec);

// Define interface for AI service responses
interface AIVideoGenerationResponse {
  success: boolean;
  videoUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

/**
 * AI Service for video generation and management
 * This would integrate with an actual AI video generation API in production
 */
export class AIService {
  private apiKey: string | null = null;
  private outputDir: string;
  private baseUrl: string;
  
  constructor() {
    // Get API key from environment variable
    this.apiKey = process.env.AI_VIDEO_API_KEY || null;
    
    // Create output directory for generated videos and thumbnails
    this.outputDir = path.join(process.cwd(), 'public', 'generated');
    this.ensureDirectoryExists(this.outputDir);
    
    // Base URL for serving generated assets - using relative paths
    this.baseUrl = process.env.BASE_URL || '';
  }
  
  private async ensureDirectoryExists(directory: string): Promise<void> {
    try {
      await fs.mkdir(directory, { recursive: true });
    } catch (error) {
      console.error('Error creating directory:', error);
      throw new Error('Failed to create output directory');
    }
  }

  /**
   * Checks if the API key is available
   */
  public isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Generates a video based on the provided parameters
   * In a real implementation, this would call an external AI video generation API
   */
  public async generateVideo(videoData: InsertVideo): Promise<AIVideoGenerationResponse> {
    // If API key is not configured, return an error
    if (!this.apiKey) {
      console.warn('AI Video API key not configured. Using placeholder video.');
      
      // Generate placeholder SVG-based video and thumbnail
      const { videoUrl, thumbnailUrl } = await this.generatePlaceholderAssets(videoData);
      
      return {
        success: true,
        videoUrl,
        thumbnailUrl
      };
    }
    
    // In a real application, make API call to AI video service
    try {
      // This is where we would make the actual API call to a service like Runway ML, Synthesia, etc.
      // For demo purposes, we're generating mock media instead
      
      console.log('Generating video with AI service...');
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate placeholder video and thumbnail
      const { videoUrl, thumbnailUrl } = await this.generatePlaceholderAssets(videoData);
      
      return {
        success: true,
        videoUrl,
        thumbnailUrl
      };
    } catch (error) {
      console.error('Error generating video:', error);
      return {
        success: false,
        error: 'Failed to generate video'
      };
    }
  }
  
  /**
   * Generates placeholder video and thumbnail assets
   * This is used when no API key is available or for demo purposes
   */
  private async generatePlaceholderAssets(videoData: InsertVideo): Promise<{ videoUrl: string, thumbnailUrl: string }> {
    try {
      const id = uuidv4();
      
      // Set up file paths
      const frameImgPath = path.join(this.outputDir, `${id}-frame.png`);
      const videoPath = path.join(this.outputDir, `${id}.mp4`);
      const thumbnailPath = path.join(this.outputDir, `${id}-thumbnail.png`);
      
      // Extract aspect ratio dimensions
      const aspectRatio = videoData.aspectRatio || '16:9';
      const [width, height] = aspectRatio.split(':').map(Number);
      
      // Create canvas image for video frame
      await this.createCanvasImage(
        frameImgPath,
        videoData.title || 'Untitled Video',
        videoData.prompt || 'No description',
        width,
        height,
        videoData.style || 'cinematic',
        false // not a thumbnail
      );
      
      // Create canvas image for thumbnail
      await this.createCanvasImage(
        thumbnailPath,
        videoData.title || 'Untitled Video',
        videoData.prompt || 'No description',
        width,
        height,
        videoData.style || 'cinematic',
        true // is a thumbnail
      );
      
      // Calculate actual pixel dimensions (standardized for video)
      const pixelWidth = 1280;
      const pixelHeight = Math.round((height / width) * pixelWidth);
      
      // Create a video from the frame image (10-30 seconds based on duration)
      const duration = videoData.duration || 10; // default duration in seconds
      
      // Generate the video using ffmpeg
      await execPromise(`ffmpeg -y -loop 1 -i ${frameImgPath} -c:v libx264 -t ${duration} -pix_fmt yuv420p -vf scale=${pixelWidth}:${pixelHeight} ${videoPath}`);
      
      // Clean up the frame image
      await fs.unlink(frameImgPath).catch(err => console.warn('Failed to delete frame image:', err));
      
      // Return public URLs
      const videoUrl = `${this.baseUrl}/generated/${path.basename(videoPath)}`;
      const thumbnailUrl = `${this.baseUrl}/generated/${path.basename(thumbnailPath)}`;
      
      return { videoUrl, thumbnailUrl };
    } catch (error) {
      console.error('Error generating video assets:', error);
      throw error;
    }
  }
  
  /**
   * Creates an image using canvas
   */
  private async createCanvasImage(
    outputPath: string, 
    title: string, 
    description: string, 
    width: number, 
    height: number, 
    style: string, 
    isThumbnail: boolean = false
  ): Promise<void> {
    // Set dimensions
    const canvasWidth = isThumbnail ? 640 : 1280;
    const canvasHeight = Math.round((height / width) * canvasWidth);
    
    // Create canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    
    // Choose color scheme based on style
    let bgColor1, bgColor2, textColor, accentColor;
    
    switch (style) {
      case 'cinematic':
        bgColor1 = '#1a2a6c';
        bgColor2 = '#b21f1f';
        textColor = '#ffffff';
        accentColor = '#fdbb2d';
        break;
      case 'animated':
        bgColor1 = '#42275a';
        bgColor2 = '#734b6d';
        textColor = '#ffffff';
        accentColor = '#f7a8d8';
        break;
      case 'professional':
        bgColor1 = '#2b5876';
        bgColor2 = '#4e4376';
        textColor = '#ffffff';
        accentColor = '#56ccf2';
        break;
      case 'energetic':
        bgColor1 = '#f12711';
        bgColor2 = '#f5af19';
        textColor = '#ffffff';
        accentColor = '#ffffff';
        break;
      case 'minimalist':
        bgColor1 = '#485563';
        bgColor2 = '#29323c';
        textColor = '#ffffff';
        accentColor = '#e0e0e0';
        break;
      default:
        bgColor1 = '#6366F1';
        bgColor2 = '#EC4899';
        textColor = '#ffffff';
        accentColor = '#8B5CF6';
    }
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, bgColor1);
    gradient.addColorStop(1, bgColor2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Add pattern overlay
    ctx.strokeStyle = accentColor;
    ctx.globalAlpha = 0.1;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(canvasWidth, canvasHeight);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight);
    ctx.lineTo(canvasWidth, 0);
    ctx.stroke();
    ctx.globalAlpha = 1;
    
    // Add style badge (only for video)
    if (!isThumbnail) {
      const badgeWidth = 120;
      const badgeHeight = 30;
      const badgeX = 20;
      const badgeY = 20;
      
      ctx.fillStyle = accentColor;
      ctx.globalAlpha = 0.8;
      
      // Rounded rectangle for badge
      ctx.beginPath();
      ctx.moveTo(badgeX + badgeHeight/2, badgeY);
      ctx.lineTo(badgeX + badgeWidth - badgeHeight/2, badgeY);
      ctx.arc(badgeX + badgeWidth - badgeHeight/2, badgeY + badgeHeight/2, badgeHeight/2, -Math.PI/2, Math.PI/2);
      ctx.lineTo(badgeX + badgeHeight/2, badgeY + badgeHeight);
      ctx.arc(badgeX + badgeHeight/2, badgeY + badgeHeight/2, badgeHeight/2, Math.PI/2, -Math.PI/2);
      ctx.fill();
      
      // Style text
      ctx.fillStyle = textColor;
      ctx.font = '16px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(style, badgeX + badgeWidth/2, badgeY + badgeHeight/2);
      ctx.globalAlpha = 1;
    }
    
    // Add title text
    ctx.fillStyle = textColor;
    ctx.font = `bold ${isThumbnail ? 24 : 36}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Truncate title if needed
    const maxTitleLength = isThumbnail ? 30 : 40;
    let displayTitle = title;
    if (title.length > maxTitleLength) {
      displayTitle = title.substring(0, maxTitleLength) + '...';
    }
    
    ctx.fillText(displayTitle, canvasWidth / 2, canvasHeight * 0.3);
    
    // Add description (only for video frames, not thumbnail)
    if (!isThumbnail) {
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.8;
      ctx.font = '24px Arial, sans-serif';
      
      // Multiline description with wrapping
      const maxDescLength = 100;
      let displayDesc = description;
      if (description.length > maxDescLength) {
        displayDesc = description.substring(0, maxDescLength) + '...';
      }
      
      // Split description into lines
      const maxLineWidth = canvasWidth * 0.8;
      const words = displayDesc.split(' ');
      const lines = [];
      let currentLine = words[0];
      
      for (let i = 1; i < words.length; i++) {
        const testLine = currentLine + ' ' + words[i];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxLineWidth) {
          lines.push(currentLine);
          currentLine = words[i];
        } else {
          currentLine = testLine;
        }
      }
      lines.push(currentLine);
      
      // Draw each line
      const lineHeight = 30;
      const startY = canvasHeight * 0.5;
      
      lines.forEach((line, index) => {
        ctx.fillText(line, canvasWidth / 2, startY + index * lineHeight);
      });
      
      ctx.globalAlpha = 1;
    }
    
    // Add play button
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const playButtonRadius = isThumbnail ? 40 : 60;
    
    // Play button background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, playButtonRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Play triangle
    ctx.fillStyle = 'white';
    ctx.beginPath();
    const triangleSize = isThumbnail ? 15 : 25;
    ctx.moveTo(centerX - triangleSize/2, centerY - triangleSize);
    ctx.lineTo(centerX - triangleSize/2, centerY + triangleSize);
    ctx.lineTo(centerX + triangleSize, centerY);
    ctx.closePath();
    ctx.fill();
    
    // Add watermark
    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.6;
    ctx.font = `${isThumbnail ? 14 : 16}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('Generated by VIDIYOME', canvasWidth / 2, canvasHeight * 0.9);
    ctx.globalAlpha = 1;
    
    // Write to file
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
  }
  
  /**
   * Creates an SVG placeholder for the video
   */
  private createVideoPlaceholderSvg(title: string, description: string, width: number, height: number, style: string): string {
    // Normalize dimensions
    const svgWidth = 800;
    const svgHeight = Math.round((height / width) * svgWidth);
    
    // Choose color scheme based on style
    let bgGradient, textColor, accentColor;
    
    switch (style) {
      case 'cinematic':
        bgGradient = 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)';
        textColor = '#ffffff';
        accentColor = '#fdbb2d';
        break;
      case 'animated':
        bgGradient = 'linear-gradient(135deg, #42275a 0%, #734b6d 100%)';
        textColor = '#ffffff';
        accentColor = '#f7a8d8';
        break;
      case 'professional':
        bgGradient = 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)';
        textColor = '#ffffff';
        accentColor = '#56ccf2';
        break;
      case 'energetic':
        bgGradient = 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)';
        textColor = '#ffffff';
        accentColor = '#ffffff';
        break;
      case 'minimalist':
        bgGradient = 'linear-gradient(135deg, #485563 0%, #29323c 100%)';
        textColor = '#ffffff';
        accentColor = '#e0e0e0';
        break;
      default:
        bgGradient = 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)';
        textColor = '#ffffff';
        accentColor = '#8B5CF6';
    }
    
    // Truncate description if too long
    const truncatedDescription = description.length > 120
      ? description.substring(0, 117) + '...'
      : description;
    
    return `
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
          </linearGradient>
          <style type="text/css">
            @keyframes pulse {
              0% { opacity: 0.8; }
              50% { opacity: 1; }
              100% { opacity: 0.8; }
            }
            .pulse {
              animation: pulse 2s infinite;
            }
          </style>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#bg)" />
        
        <!-- Video style indicator -->
        <rect x="${svgWidth * 0.05}" y="${svgHeight * 0.05}" width="${svgWidth * 0.9}" height="${svgHeight * 0.9}" fill="none" stroke="${accentColor}" stroke-width="4" rx="10" />
        
        <!-- Play button -->
        <circle cx="${svgWidth/2}" cy="${svgHeight/2}" r="60" fill="rgba(255,255,255,0.2)" class="pulse" />
        <path d="M${svgWidth/2 - 20} ${svgHeight/2 - 30} L${svgWidth/2 - 20} ${svgHeight/2 + 30} L${svgWidth/2 + 40} ${svgHeight/2} Z" fill="white" />
        
        <!-- Title -->
        <text x="${svgWidth/2}" y="${svgHeight * 0.2}" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="${textColor}" text-anchor="middle">${title}</text>
        
        <!-- Description -->
        <foreignObject x="${svgWidth * 0.2}" y="${svgHeight * 0.7}" width="${svgWidth * 0.6}" height="${svgHeight * 0.2}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 16px; color: ${textColor}; text-align: center;">
            ${truncatedDescription}
          </div>
        </foreignObject>
        
        <!-- Style badge -->
        <rect x="${svgWidth * 0.05 + 10}" y="${svgHeight * 0.05 + 10}" width="120" height="30" rx="15" fill="${accentColor}" />
        <text x="${svgWidth * 0.05 + 70}" y="${svgHeight * 0.05 + 30}" font-family="Arial, sans-serif" font-size="16" fill="${textColor}" text-anchor="middle" alignment-baseline="middle">${style}</text>
      </svg>
    `;
  }
  
  /**
   * Creates an SVG placeholder for the thumbnail
   */
  private createThumbnailPlaceholderSvg(title: string, width: number, height: number, style: string): string {
    // Normalize dimensions
    const svgWidth = 400;
    const svgHeight = Math.round((height / width) * svgWidth);
    
    // Choose color scheme based on style
    let bgGradient, textColor, accentColor;
    
    switch (style) {
      case 'cinematic':
        bgGradient = 'linear-gradient(135deg, #1a2a6c 0%, #b21f1f 50%, #fdbb2d 100%)';
        textColor = '#ffffff';
        accentColor = '#fdbb2d';
        break;
      case 'animated':
        bgGradient = 'linear-gradient(135deg, #42275a 0%, #734b6d 100%)';
        textColor = '#ffffff';
        accentColor = '#f7a8d8';
        break;
      case 'professional':
        bgGradient = 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)';
        textColor = '#ffffff';
        accentColor = '#56ccf2';
        break;
      case 'energetic':
        bgGradient = 'linear-gradient(135deg, #f12711 0%, #f5af19 100%)';
        textColor = '#ffffff';
        accentColor = '#ffffff';
        break;
      case 'minimalist':
        bgGradient = 'linear-gradient(135deg, #485563 0%, #29323c 100%)';
        textColor = '#ffffff';
        accentColor = '#e0e0e0';
        break;
      default:
        bgGradient = 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)';
        textColor = '#ffffff';
        accentColor = '#8B5CF6';
    }
    
    // Truncate title if too long
    const truncatedTitle = title.length > 40
      ? title.substring(0, 37) + '...'
      : title;
    
    return `
      <svg width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="thumbnail-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#EC4899;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#000" flood-opacity="0.3" />
          </filter>
        </defs>
        
        <!-- Background -->
        <rect width="100%" height="100%" fill="url(#thumbnail-bg)" />
        
        <!-- Overlay pattern -->
        <path d="M0 ${svgHeight} L${svgWidth} ${svgHeight * 0.7} L${svgWidth} ${svgHeight} Z" fill="rgba(0,0,0,0.3)" />
        
        <!-- Title at bottom -->
        <foreignObject x="${svgWidth * 0.1}" y="${svgHeight * 0.7}" width="${svgWidth * 0.8}" height="${svgHeight * 0.25}">
          <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 18px; font-weight: bold; color: ${textColor}; text-align: center; filter: drop-shadow(0px 1px 3px rgba(0,0,0,0.5));">
            ${truncatedTitle}
          </div>
        </foreignObject>
        
        <!-- Play icon (simplified) -->
        <circle cx="${svgWidth/2}" cy="${svgHeight/2}" r="40" fill="rgba(255,255,255,0.2)" />
        <path d="M${svgWidth/2 - 15} ${svgHeight/2 - 20} L${svgWidth/2 - 15} ${svgHeight/2 + 20} L${svgWidth/2 + 25} ${svgHeight/2} Z" fill="white" />
      </svg>
    `;
  }
}

// Export singleton instance
export const aiService = new AIService();