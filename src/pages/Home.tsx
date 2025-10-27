import React from "react";
import { useNavigate } from "react-router-dom";
import kibiaiLogo from "../assets/images/kibiai.png";
import titleImage from "../assets/images/title.png";
import skeletonImage from "../assets/images/skeleton.png";
import kibizsystems from "../assets/images/kibizsystems.png";

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-start bg-white">
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center w-full h-full px-8 py-12 lg:px-12 lg:py-14 xl:px-16 xl:py-12">
        {/* Top Section - KiBiz Systems + PRESENTS */}
        <div className="flex flex-col items-center gap-2 lg:gap-3 xl:gap-2">
          <img
            src={kibizsystems}
            alt="KiBiz Systems"
            className="h-14 lg:h-20 xl:h-16 object-contain"
          />
          <p className="text-sm lg:text-base xl:text-sm text-[#7456e1] font-semibold tracking-[0.2em] mt-2 lg:mt-3 xl:mt-2">
            PRESENTS
          </p>
        </div>

        {/* Middle Section - Title + Tagline + Button */}
        <div className="flex flex-col items-center justify-center gap-8 lg:gap-10 xl:gap-8 text-center">
          <img
            src={titleImage}
            alt="Prompt-O-Saurus"
            className="h-16 lg:h-28 xl:h-20 w-auto object-contain"
          />
          <p className="text-[#3b3b3b] text-xl lg:text-2xl xl:text-xl font-semibold max-w-lg lg:max-w-xl xl:max-w-lg leading-relaxed px-4">
            Prompt now to join the leaderboard!
          </p>

          <button
            className="bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 lg:gap-4 xl:gap-3 px-10 py-4 lg:px-12 lg:py-5 xl:px-10 xl:py-4 text-lg lg:text-xl xl:text-lg mt-4 lg:mt-6 xl:mt-4"
            onClick={() => navigate("/instructions")}
          >
            <img src={skeletonImage} alt="" className="h-6 lg:h-8 xl:h-6" />
            <span>START NOW</span>
          </button>
        </div>

        {/* Bottom Section - POWERED BY + KiBi-AI Logo */}
        <div className="flex flex-col items-center gap-2 lg:gap-3 xl:gap-2">
          <p className="text-[#7456e1] text-sm lg:text-base xl:text-sm font-semibold tracking-[0.2em] mb-1 lg:mb-2 xl:mb-1">
            POWERED BY
          </p>
          <img
            src={kibiaiLogo}
            alt="KiBi-AI"
            className="h-20 lg:h-28 xl:h-20 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
