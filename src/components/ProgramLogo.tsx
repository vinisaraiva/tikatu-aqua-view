import { useState, useEffect } from 'react';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';

interface ProgramLogoProps {
  src: string;
  alt: string;
  title: string;
  subtitle: string;
}

const ProgramLogo = ({ src, alt, title, subtitle }: ProgramLogoProps) => {
  const [processedImageSrc, setProcessedImageSrc] = useState<string>(src);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      try {
        setIsProcessing(true);
        const img = await loadImage(src);
        const processedSrc = await removeBackground(img);
        setProcessedImageSrc(processedSrc);
      } catch (error) {
        console.error('Failed to process image:', error);
        // Keep original image if processing fails
        setProcessedImageSrc(src);
      } finally {
        setIsProcessing(false);
      }
    };

    processImage();
  }, [src]);

  return (
    <div className="flex items-center space-x-3 group">
      <div className="relative">
        {/* Background with subtle gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-water-blue/5 to-teal-accent/10 rounded-xl blur-sm transform group-hover:scale-110 transition-transform duration-300" />
        
        {/* Image container with enhanced styling */}
        <div className="relative h-14 w-14 bg-gradient-to-br from-white/20 to-white/5 rounded-xl p-2 backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300">
          {isProcessing ? (
            <div className="w-full h-full bg-gray-600/20 rounded-lg animate-pulse" />
          ) : (
            <img 
              src={processedImageSrc} 
              alt={alt}
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
        <p className="font-medium">{title}</p>
        <p>{subtitle}</p>
      </div>
    </div>
  );
};

export default ProgramLogo;
