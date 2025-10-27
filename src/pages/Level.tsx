import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import skeletonImage from "../assets/images/skeleton.png";
import { useAppContext } from "../context/AppContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

import one from "../assets/images/1.png";
import two from "../assets/images/2.png";
import three from "../assets/images/3.png";
import four from "../assets/images/4.png";

const Level: React.FC = () => {
  const { isUserSignedIn, level, setLevel } = useAppContext();
  const navigate = useNavigate();

  // Local state to track selection
  const [selectedLevel, setSelectedLevel] = useState(level || "");

  const levels = [
    { src: one, label: "EASY" },
    { src: two, label: "MEDIUM" },
    { src: three, label: "HARD" },
    { src: four, label: "EXPERT" },
  ];

  const handleSelect = (label: string) => {
    setSelectedLevel(label);
    setLevel(label);
  };

  const handleClick = () => {
    if (!selectedLevel) {
      alert("Please select a level before continuing.");
      return;
    }

    if (isUserSignedIn()) {
      navigate("/preview");
    } else {
      navigate("/user-form");
    }
  };

  return (
    <div className="w-screen min-h-screen bg-white flex justify-center items-start overflow-hidden">
      <div className="grid grid-rows-[auto_1fr_auto] w-full min-h-screen px-6 py-6 lg:py-10 xl:py-2 max-w-2xl mx-auto">
        {/* Header Section */}
        <Header />

        {/* Level Selection Section */}
        <div className="flex flex-col items-center justify-center gap-8 text-center">
          <p className="text-[#5e17eb] text-xl lg:text-2xl font-bold mb-4">
            Choose a level to continue
          </p>

          <div className="grid grid-cols-2 gap-8 lg:gap-12 w-full max-w-md">
            {levels.map((item, index) => (
              <div
                key={index}
                onClick={() => handleSelect(item.label)}
                className={`flex flex-col items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 ${
                  selectedLevel === item.label ? "scale-105" : ""
                }`}
              >
                <div
                  className={`rounded-2xl shadow-md p-2 border-4 ${
                    selectedLevel === item.label
                      ? "border-[#5e17eb] bg-purple-100"
                      : "border-transparent bg-gray-100"
                  }`}
                >
                  <img
                    src={item.src}
                    alt={item.label}
                    className="w-full h-auto rounded-xl object-contain"
                  />
                </div>
                <p
                  className={`text-sm lg:text-lg font-semibold mt-2 ${
                    selectedLevel === item.label
                      ? "text-[#5e17eb]"
                      : "text-gray-800"
                  }`}
                >
                  {item.label}
                </p>
              </div>
            ))}
          </div>

          {/* Continue Button */}
          <div className="mt-10">
            <button
              className="bg-[#5e17eb] hover:bg-purple-700 text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-8 py-3 text-lg"
              onClick={handleClick}
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

export default Level;
