import React from "react";
import kibiaiLogo from "../../assets/images/kibiai.png";

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-gray-200  mt-5">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 xl:px-8">
        <div className="py-6 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Left side - Copyright or additional info */}
          <div className="text-xs text-gray-400 order-2 lg:order-1">
            © {new Date().getFullYear()} All rights reserved
          </div>

          {/* Center - Powered by */}
          <div className="flex items-center gap-2 order-1 lg:order-2">
            <span className="text-sm text-gray-600 font-medium">
              Powered by
            </span>
            <img
              src={kibiaiLogo}
              alt="KibAI"
              className="h-12 object-contain transition-opacity hover:opacity-100 opacity-80"
            />
          </div>

          {/* Right side - Links (optional) */}
          <div className="flex items-center gap-4 text-xs text-gray-500 order-3">
            <a href="#" className="hover:text-gray-700 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
