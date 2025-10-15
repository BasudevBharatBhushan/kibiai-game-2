import React from "react";
import { useNavigate } from "react-router-dom";
import kibiaiLogo from "../assets/images/kibiai.png";
import titleImage from "../assets/images/title.png";
import skeletonImage from "../assets/images/skeleton.png";
import kibizsystems from "../assets/images/kibizsystems.png";

const Score: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center overflow-hidden">
      <div className="flex flex-col justify-between items-center w-full h-full px-6 py-12 lg:py-14 xl:py-2 max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-4">
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

        {/* Middle Section (Card + Button) */}
        <div className="flex flex-col items-center justify-center flex-1 w-full mt-6 mb-4">
          {/* Score Card */}
          <div className="bg-gray-100 rounded-2xl shadow-md p-8 flex flex-col items-center justify-center text-center w-full max-w-md mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-[#5e17eb] mb-2">
              Hello, Basudev
            </h1>
            <p className="text-gray-700 text-base lg:text-lg font-medium mb-8">
              PROMPT-SAURUS
            </p>

            <h2 className="text-xl lg:text-2xl font-bold text-[#5e17eb] mb-4">
              TOTAL POINTS
            </h2>
            <div className="text-6xl font-bold text-[#5e17eb] mb-8 tracking-wide">
              3 0
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-lg mb-2 font-medium">
                YOUR RANK:
              </p>
              <p className="text-3xl font-bold text-[#5e17eb]">21</p>
            </div>
          </div>

          {/* Try Again Button */}
          <button
            className="bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-8 py-3 text-lg"
            onClick={() => navigate("/level")}
          >
            <img src={skeletonImage} alt="" className="h-6 lg:h-7" />
            <span>TRY AGAIN</span>
          </button>
        </div>

        {/* Footer */}
        <div className="flex flex-col items-center gap-2 mt-4 mb-2">
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

export default Score;
