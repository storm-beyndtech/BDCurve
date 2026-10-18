import React from "react";
import { motion } from "framer-motion";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface VideoShowcaseProps {
  /**
   * Video source URL
   */
  videoSrc: string;
  /**
   * Optional title
   */
  title?: string;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Auto-play video
   * @default true
   */
  autoPlay?: boolean;
  /**
   * Loop video
   * @default true
   */
  loop?: boolean;
  /**
   * Mute video by default
   * @default true
   */
  muted?: boolean;
  /**
   * Optional className
   */
  className?: string;
}

export function VideoShowcase({
  videoSrc,
  title,
  description,
  autoPlay = true,
  loop = true,
  muted = true,
  className,
}: VideoShowcaseProps) {
  const [isPlaying, setIsPlaying] = React.useState(autoPlay);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className={cn("section-spacing-lg w-full relative overflow-hidden", className)}>
      {/* Dark surround for light mode - creates a dark container */}
      <div className="absolute inset-0 bg-background dark:bg-transparent"/>
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background dark:from-transparent dark:via-transparent dark:to-transparent"/>

      <div className="container-wide container-padding relative z-10">
        {/* Header */}
        {(title || description) && (
          <div className="text-center mb-12 max-w-3xl mx-auto">
            {title && (
              <motion.h2
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {title}
              </motion.h2>
            )}
            {description && (
              <motion.p
                className="text-lg text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                {description}
              </motion.p>
            )}
          </div>
        )}

        {/* Video Container */}
        <motion.div
          className="relative max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Dark background for light mode */}
          <div className="absolute -inset-12 bg-gradient-radial from-muted/40 via-muted/20 to-transparent dark:from-transparent dark:via-transparent dark:to-transparent rounded-full blur-3xl"/>

          {/* Video wrapper with glass effect */}
          <div className="relative rounded-2xl overflow-hidden shadow-depth-lg border border-glass bg-glass-card backdrop-blur-sm">
            {/* Video element */}
            <div className="relative aspect-video bg-black/5 dark:bg-black/20">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay={autoPlay}
                loop={loop}
                muted={muted}
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                <source src={videoSrc} type="video/mp4"/>
                <source src={videoSrc.replace('.mp4', '.webm')} type="video/webm"/>
                Your browser does not support the video tag.
              </video>

              {/* Play/Pause overlay button */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/20 backdrop-blur-sm">
                <Button
                  variant="glass"
                  size="lg"
                  onClick={togglePlay}
                  className="rounded-full w-16 h-16 p-0 shadow-depth-lg"
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6"/>
                  ) : (
                    <Play className="h-6 w-6 ml-1"/>
                  )}
                </Button>
              </div>
            </div>

            {/* Subtle border glow */}
            <div className="absolute inset-0 rounded-2xl border border-primary-500/10 pointer-events-none"/>
          </div>

          {/* Decorative elements */}
          <motion.div
            className="absolute -bottom-6 -right-6 w-32 h-32 rounded-full bg-primary-500/5 dark:bg-primary-500/10 blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}/>

          <motion.div
            className="absolute -top-6 -left-6 w-32 h-32 rounded-full bg-accent-500/5 dark:bg-accent-500/10 blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}/>
        </motion.div>
      </div>
    </section>
  );
}


