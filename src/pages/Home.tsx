import React from "react";
import { useNavigate } from "react-router-dom";
import kibiaiLogo from "../assets/images/kibiai.png";
import titleImage from "../assets/images/title.png";
import skeletonImage from "../assets/images/skeleton.png";
import kibizsystems from "../assets/images/kibizsystems.png";

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center bg-white">
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center w-full h-full px-6 py-16 lg:py-20">
        {/* Top Section - KiBiz Systems + PRESENTS */}
        <div className="flex flex-col items-center gap-3">
          <img
            src={kibizsystems}
            alt="KiBiz Systems"
            className="h-16 lg:h-20 object-contain"
          />
          <p className="text-sm lg:text-lg text-[#7456e1] font-semibold tracking-wide mt-4">
            PRESENTS
          </p>
        </div>

        {/* Middle Section - Title + Tagline + Button */}
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <img
            src={titleImage}
            alt="Prompt-O-Saurus"
            className="h-36 lg:h-48 w-auto object-contain"
          />
          <p className="text-[#3b3b3b] text-lg lg:text-2xl font-semibold max-w-md leading-snug">
            Prompt now to join the leaderboard!
          </p>

          <button
            className="bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-8 py-3 text-lg"
            onClick={() => navigate("/instructions")}
          >
            <img src={skeletonImage} alt="" className="h-6 lg:h-7" />
            <span>START NOW</span>
          </button>
        </div>

        {/* Bottom Section - POWERED BY + KiBi-AI Logo */}
        <div className="flex flex-col items-center gap-3">
          <p className="text-[#7456e1] text-sm lg:text-lg font-semibold mt-3">
            POWERED BY
          </p>
          <img
            src={kibiaiLogo}
            alt="KiBi-AI"
            className="h-24 lg:h-32 mt-2 object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
