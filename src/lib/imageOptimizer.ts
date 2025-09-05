import sharp from 'sharp';
import { promises as fs } from 'fs';
import path from 'path';

export interface OptimizeImageOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

export async function optimizeImage(
  inputPath: string,
  outputPath: string,
  options: OptimizeImageOptions = {}
): Promise<void> {
  const {
    quality = 85,
    format = 'webp',
    width,
    height,
    fit = 'cover'
  } = options;

  try {
    let pipeline = sharp(inputPath);

    // Resize if dimensions provided
    if (width || height) {
      pipeline = pipeline.resize(width, height, { fit });
    }

    // Convert format and set quality
    switch (format) {
      case 'webp':
        pipeline = pipeline.webp({ quality });
        break;
      case 'avif':
        pipeline = pipeline.avif({ quality });
        break;
      case 'jpeg':
        pipeline = pipeline.jpeg({ quality });
        break;
      case 'png':
        pipeline = pipeline.png({ quality });
        break;
    }

    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });

    // Save optimized image
    await pipeline.toFile(outputPath);
    
    console.log(`Optimized: ${inputPath} -> ${outputPath}`);
  } catch (error) {
    console.error(`Failed to optimize ${inputPath}:`, error);
    throw error;
  }
}

export async function optimizePublicImages(): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  const otherPicsDir = path.join(publicDir, 'OtherPics');
  
  try {
    const files = await fs.readdir(otherPicsDir);
    const imageFiles = files.filter(file => 
      /\.(png|jpg|jpeg)$/i.test(file)
    );

    for (const file of imageFiles) {
      const inputPath = path.join(otherPicsDir, file);
        const nameWithoutExt = path.parse(file).name;
        
        const sizes = [
          { name: 'small', width: 640 },
          { name: 'medium', width: 1200 },
          { name: 'large', width: 1920 },
        ];

        for (const size of sizes) {
          // Create WebP versions
          const webpPath = path.join(otherPicsDir, `${nameWithoutExt}-${size.name}.webp`);
          await optimizeImage(inputPath, webpPath, {
            format: 'webp',
            quality: 85,
            width: size.width,
          });

          // Create AVIF versions
          const avifPath = path.join(otherPicsDir, `${nameWithoutExt}-${size.name}.avif`);
          await optimizeImage(inputPath, avifPath, {
            format: 'avif',
            quality: 80,
            width: size.width,
          });
        }
      }
    } catch (error) {
    console.error('Failed to optimize public images:', error);
  }
}
