import React from "react";
import kibizsystems from "../../assets/images/kibizsystems.png";
import titleImage from "../../assets/images/title.png";
import kibiaiLogo from "../../assets/images/kibiai.png";

//Header Component

const Header: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 mb-6">
      <img src={kibizsystems} alt="KiBiz" className=" h-12 lg:h-16 xl:h-14" />
      <img
        src={titleImage}
        alt="Prompt-O-Saurus"
        className=" h-16 lg:h-24 xl:h-20"
      />
    </div>
  );
};

export default Header;
