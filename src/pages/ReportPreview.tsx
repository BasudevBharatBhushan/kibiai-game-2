import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import skeletonImage from "../assets/images/skeleton.png";
import DynamicReport from "../components/sections/DynamicReport";
import { useAppContext } from "../context/AppContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const ReportPreview: React.FC = () => {
  const { reportJson } = useAppContext();
  const navigate = useNavigate();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (reportJson && Object.keys(reportJson).length > 0) {
      setIsReady(true);
    }
  }, [reportJson]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center overflow-x-hidden overflow-y-auto p-4 lg:p-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header */}
        <Header />

        {/* Report Container */}
        <div
          className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden relative"
          style={{
            height: "calc(100vh - 300px)",
            minHeight: "500px",
            maxHeight: "800px",
          }}
        >
          {isReady ? (
            <div
              className="w-full h-full overflow-y-auto p-2 lg:p-4 
              [&::-webkit-scrollbar]:w-1.5 
              [&::-webkit-scrollbar-thumb]:bg-gray-50 
              [&::-webkit-scrollbar-thumb:hover]:bg-gray-100 
              [&::-webkit-scrollbar-track]:bg-transparent 
              [scrollbar-width:thin]"
            >
              <DynamicReport key={Date.now()} jsonData={reportJson} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-600 font-semibold p-6">
                No report data available. Please generate one first.
              </div>
            </div>
          )}
        </div>

        {/* Caption */}
        <p className="text-[#5e17eb] text-center text-base xl:text-xl font-bold mt-6 mb-4 px-4 leading-snug">
          {isReady
            ? "Here’s your generated report preview"
            : "Awaiting generated report data"}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-2 mb-8">
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
              <img src={skeletonImage} alt="" className="h-5 lg:h-6 xl:h-7" />
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
