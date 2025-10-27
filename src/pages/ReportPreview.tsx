import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images

import skeletonImage from "../assets/images/skeleton.png";

import DynamicReport from "../components/sections/DynamicReport";
import { useAppContext } from "../context/AppContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

// 🧩 Custom hook for responsive scaling
const useResponsiveScale = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const contentWidth = contentRef.current.scrollWidth;
        const availableWidth = containerWidth - 100;

        if (contentWidth > availableWidth) {
          const newScale = availableWidth / contentWidth;
          setScale(Math.min(newScale, 1));
        } else {
          setScale(1);
        }
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return { containerRef, contentRef, scale };
};

const ReportPreview: React.FC = () => {
  const { containerRef, contentRef, scale } = useResponsiveScale();
  const { reportJson } = useAppContext();
  const navigate = useNavigate();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (reportJson && Object.keys(reportJson).length > 0) {
      setIsReady(true);
    }
  }, [reportJson]);

  console.log("Report JSON:", reportJson);

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center overflow-x-hidden overflow-y-auto">
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center w-full h-full px-6 py-6 lg:py-10 xl:py-2 max-w-2xl mx-auto">
        {/* Header */}
        <Header />

        {/* Report Section */}
        <div
          ref={containerRef}
          overflow-hidden
          className="bg-gray-100 rounded-2xl shadow-md p-6 lg:p-8 w-full flex justify-center items-start overflow-hidden relative "
          style={{ height: "800px" }}
        >
          {isReady ? (
            <div
              ref={contentRef}
              className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                transition: "transform 0.3s ease",
              }}
            >
              <DynamicReport key={Date.now()} jsonData={reportJson} />
            </div>
          ) : (
            <div className="text-center text-gray-600 font-semibold">
              No report data available. Please generate one first.
            </div>
          )}
        </div>

        {/* Caption */}
        <p className="text-[#5e17eb] text-center text-base lg:text-xl font-bold mt-6 mb-4 px-4 leading-snug">
          {isReady
            ? "Here’s your generated report preview"
            : "Awaiting generated report data"}
        </p>

        {/* Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-6 py-2 text-md"
            onClick={() => navigate("/generate-report")}
          >
            ⬅ Back to Home
          </button>

          {isReady && (
            <button
              className="bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-6 py-2 text-md"
              onClick={() => navigate("/score")}
            >
              <img src={skeletonImage} alt="" className="h-5 lg:h-6" />
              <span>View Score</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default ReportPreview;
