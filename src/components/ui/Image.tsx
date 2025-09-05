import { forwardRef, useRef, useEffect, useState } from 'react';
import NextImage, { ImageProps as NextImageProps } from 'next/image';

export interface ImageProps extends Omit<NextImageProps, 'loading'> {
  /**
   * If true, will always use lazy loading regardless of position
   * If false, will never use lazy loading
   * If undefined (default), will use intersection observer to determine if image is in viewport
   */
  lazy?: boolean;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ lazy, className = '', ...props }, ref) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const [isInView, setIsInView] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
      setIsMounted(true);
      
      // If lazy is explicitly set, don't use intersection observer
      if (lazy !== undefined) return;
      
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        {
          rootMargin: '200px 0px', // Load images 200px before they enter the viewport
          threshold: 0.01,
        }
      );

      const currentRef = imageRef.current;
      if (currentRef) {
        observer.observe(currentRef);
      }

      return () => {
        if (currentRef) {
          observer.unobserve(currentRef);
        }
        observer.disconnect();
      };
    }, [lazy]);

    // If we're not in the browser, always use lazy loading for below-the-fold images
    const isServer = typeof window === 'undefined';
    const shouldLazyLoad = lazy ?? (!isMounted || !isInView);

    return (
      <div ref={imageRef} className={className}>
        <NextImage
          {...props}
          ref={ref}
          loading={isServer || shouldLazyLoad ? 'lazy' : 'eager'}
          decoding="async"
        />
      </div>
    );
  }
);

Image.displayName = 'Image';

export { Image };
