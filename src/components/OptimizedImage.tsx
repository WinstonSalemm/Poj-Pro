'use client';

import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  fill?: boolean;
  responsive?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  sizes,
  quality = 85,
  fill = false,
  responsive = true,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate optimized image sources
  const getOptimizedSrc = (originalSrc: string, format: 'webp' | 'avif' | 'original' = 'original') => {
    if (!originalSrc.startsWith('/OtherPics/')) {
      return originalSrc;
    }

    const pathParts = originalSrc.split('.');
    pathParts.pop();
    const basePath = pathParts.join('.');

    switch (format) {
      case 'webp':
        return `${basePath}.webp`;
      case 'avif':
        return `${basePath}.avif`;
      default:
        return originalSrc;
    }
  };

  // Generate responsive sizes for large images
  const getResponsiveSrc = (originalSrc: string, size: 'small' | 'medium' | 'large' = 'large') => {
    if (!originalSrc.startsWith('/OtherPics/') || !responsive) {
      return originalSrc;
    }

    const pathParts = originalSrc.split('.');
    pathParts.pop();
    const basePath = pathParts.join('.');

    return `${basePath}-${size}.webp`;
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Fallback to original image if optimized versions fail
  const imageSrc = imageError ? src : getOptimizedSrc(src, 'webp');

  return (
    <div className={`relative ${className}`}>
      {/* Loading placeholder */}
      {!imageLoaded && !imageError && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse rounded"
          style={{ width, height }}
        />
      )}

      <picture>
        {/* AVIF for modern browsers */}
        {!imageError && (
          <source
            srcSet={responsive ? `
              ${getResponsiveSrc(getOptimizedSrc(src, 'avif'), 'small')} 640w,
              ${getResponsiveSrc(getOptimizedSrc(src, 'avif'), 'medium')} 1200w,
              ${getResponsiveSrc(getOptimizedSrc(src, 'avif'), 'large')} 1920w,
              ${getOptimizedSrc(src, 'avif')} 2048w
            ` : getOptimizedSrc(src, 'avif')}
            sizes={sizes || (responsive ? '(max-width: 640px) 640px, (max-width: 1200px) 1200px, 1920px' : undefined)}
            type="image/avif"
          />
        )}

        {/* WebP for most browsers */}
        {!imageError && (
          <source
            srcSet={responsive ? `
              ${getResponsiveSrc(src, 'small')} 640w,
              ${getResponsiveSrc(src, 'medium')} 1200w,
              ${getResponsiveSrc(src, 'large')} 1920w,
              ${getOptimizedSrc(src, 'webp')} 2048w
            ` : getOptimizedSrc(src, 'webp')}
            sizes={sizes || (responsive ? '(max-width: 640px) 640px, (max-width: 1200px) 1200px, 1920px' : undefined)}
            type="image/webp"
          />
        )}

        {/* Fallback to original */}
        <Image
          src={imageSrc}
          alt={alt}
          width={fill ? undefined : width}
          height={fill ? undefined : height}
          fill={fill}
          priority={priority}
          quality={quality}
          sizes={sizes}
          className={`transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          {...props}
        />
      </picture>
    </div>
  );
}
