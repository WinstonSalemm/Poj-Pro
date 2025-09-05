const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function optimizeImage(inputPath, outputPath, options = {}) {
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
    
    const inputStats = await fs.stat(inputPath);
    const outputStats = await fs.stat(outputPath);
    const savings = ((inputStats.size - outputStats.size) / inputStats.size * 100).toFixed(1);
    
    console.log(`✓ Optimized: ${path.basename(inputPath)} -> ${path.basename(outputPath)}`);
    console.log(`  Size: ${(inputStats.size / 1024 / 1024).toFixed(2)}MB -> ${(outputStats.size / 1024 / 1024).toFixed(2)}MB (${savings}% reduction)`);
  } catch (error) {
    console.error(`✗ Failed to optimize ${inputPath}:`, error.message);
  }
}

async function optimizePublicImages() {
  const publicDir = path.join(process.cwd(), 'public');
  const otherPicsDir = path.join(publicDir, 'OtherPics');
  
  try {
    const files = await fs.readdir(otherPicsDir);
    const imageFiles = files.filter(file => 
      /\.(png|jpg|jpeg)$/i.test(file) && !file.includes('.webp') && !file.includes('.avif')
    );

    console.log(`Found ${imageFiles.length} images to optimize...`);

    for (const file of imageFiles) {
      const inputPath = path.join(otherPicsDir, file);
      const stats = await fs.stat(inputPath);
      
      console.log(`\nProcessing: ${file} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
      
      // Only optimize files larger than 100KB
      if (stats.size > 100 * 1024) {
        const nameWithoutExt = path.parse(file).name;
        
        // Create WebP version
        const webpPath = path.join(otherPicsDir, `${nameWithoutExt}.webp`);
        await optimizeImage(inputPath, webpPath, { 
          format: 'webp', 
          quality: 85 
        });

        // Create AVIF version for modern browsers
        const avifPath = path.join(otherPicsDir, `${nameWithoutExt}.avif`);
        await optimizeImage(inputPath, avifPath, { 
          format: 'avif', 
          quality: 80 
        });

        // Create responsive sizes for large images
        if (stats.size > 1024 * 1024) { // > 1MB
          // Large size (1920px)
          const largePath = path.join(otherPicsDir, `${nameWithoutExt}-large.webp`);
          await optimizeImage(inputPath, largePath, { 
            format: 'webp', 
            quality: 85,
            width: 1920
          });

          // Medium size (1200px)
          const mediumPath = path.join(otherPicsDir, `${nameWithoutExt}-medium.webp`);
          await optimizeImage(inputPath, mediumPath, { 
            format: 'webp', 
            quality: 85,
            width: 1200
          });

          // Small size (640px)
          const smallPath = path.join(otherPicsDir, `${nameWithoutExt}-small.webp`);
          await optimizeImage(inputPath, smallPath, { 
            format: 'webp', 
            quality: 85,
            width: 640
          });
        }
      } else {
        console.log(`  Skipping (file too small)`);
      }
    }

    console.log('\n✓ Image optimization completed!');
  } catch (error) {
    console.error('✗ Failed to optimize public images:', error);
  }
}

// Run optimization
optimizePublicImages().catch(console.error);
