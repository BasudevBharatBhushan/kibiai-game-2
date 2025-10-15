import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images
import titleImage from "../assets/images/title.png";
import skeletonImage from "../assets/images/skeleton.png";
import kibizsystems from "../assets/images/kibizsystems.png";
import kibiaiLogo from "../assets/images/kibiai.png";
import DynamicReport from "../components/sections/DynamicReport";
import { useAppContext } from "../context/AppContext";

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
        const availableWidth = containerWidth - 60;

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
    <div className="w-screen min-h-screen bg-white flex justify-center items-center overflow-x-hidden overflow-y-auto">
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center w-full h-full px-6 py-12 lg:py-16 xl:py-2 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-4 mb-4">
          <img
            src={kibizsystems}
            alt="KiBiz Systems"
            className="h-16 lg:h-20 object-contain"
          />
          <img
            src={titleImage}
            alt="Prompt-O-Saurus"
            className="h-24 lg:h-32 object-contain"
          />
        </div>

        {/* Report Section */}
        <div
          ref={containerRef}
          className="bg-gray-100 rounded-2xl shadow-md p-6 lg:p-8 w-full flex justify-center items-start overflow-hidden relative"
          style={{ minHeight: "60vh" }}
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
        <div className="flex flex-col items-center gap-2 mt-2 mb-2">
          <p className="text-[#7456e1] text-sm lg:text-base font-semibold">
            POWERED BY
          </p>
          <img
            src={kibiaiLogo}
            alt="KiBi-AI"
            className="h-16 lg:h-20 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default ReportPreview;
