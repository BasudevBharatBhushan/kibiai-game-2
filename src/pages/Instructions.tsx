import React from "react";
import { useNavigate } from "react-router-dom";
import skeletonImage from "../assets/images/skeleton.png";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const Instructions: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-screen  min-h-[calc(100vh-60px)] bg-white flex justify-center items-start overflow-hidden">
      <div className="grid grid-rows-[auto_1fr_auto] w-full min-h-screen px-6 py-6 lg:py-10 xl:py-2 max-w-2xl mx-auto">
        {/* Header Section - KiBiz + Title */}
        <Header />

        {/* Main Content - Instructions Card + Button */}
        <div className="flex flex-col items-center justify-center w-full">
          {/* Instructions Card */}
          <div className="bg-gray-100 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-md w-full">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#5e17eb] mb-8">
              Instructions
            </h1>

            <div className="space-y-5 text-left w-full max-w-md mx-auto">
              {[
                "Pick a challenge level.",
                "Preview the sample report.",
                "Write and submit your prompt.",
                "See your prompt results as report preview.",
                "Get your AI-based score based on similarity.",
                "Keep going to climb the leaderboard!",
              ].map((text, index) => (
                <div
                  key={index}
                  className="flex justify-start items-baseline gap-3 text-gray-800 text-base lg:text-lg leading-snug"
                >
                  <span className="bg-[#5e17eb] text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                    {index + 1}
                  </span>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Button */}
          <div className="mt-8">
            <button
              className="bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-8 py-3 text-lg"
              onClick={() => navigate("/level")}
            >
              <img src={skeletonImage} alt="" className="h-6 lg:h-7" />
              <span>CONTINUE</span>
            </button>
          </div>
        </div>

        {/* Footer Component */}
        <Footer />
      </div>
    </div>
  );
};

export default Instructions;
