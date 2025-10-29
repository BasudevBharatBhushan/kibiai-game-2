import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AnimatedLoaderProps {
  processStart: boolean;
  processStage: number;
}

const stageImages: Record<number, string> = {
  1: "/images/loader_stage1-rmbg.png",
  2: "/images/loader_stage2-rmbg.png",
  3: "/images/loader_stage3-rmbg.png",
};

const stageTexts: Record<number, string> = {
  1: "nesting",
  2: "hatching",
  3: "shedding",
};

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  processStart,
  processStage,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const currentImage = stageImages[processStage] || stageImages[1];
  const currentText = stageTexts[processStage] || "loading";

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.src = currentImage;
    img.onload = () => setImageLoaded(true);
  }, [currentImage]);

  if (!processStart) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={processStage}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="flex flex-col items-center justify-center text-center"
        >
          {/* Loader Image */}
          {imageLoaded && (
            <motion.img
              src={currentImage}
              alt={`Stage ${processStage}`}
              className="h-64 object-contain"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          )}

          {/* Loader Text */}
          {imageLoaded && (
            <motion.div
              className="mt-6 text-white font-light tracking-wide flex items-center justify-center"
              style={{
                fontSize: "2rem",
                lineHeight: "1.2",
                textTransform: "lowercase",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {currentText}
              <motion.span
                className="ml-1"
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                ...
              </motion.span>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedLoader;
