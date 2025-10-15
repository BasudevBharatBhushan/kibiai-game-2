import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images
import titleImage from "../assets/images/title.png";
import skeletonImage from "../assets/images/skeleton.png";
import kibizsystems from "../assets/images/kibizsystems.png";
import DynamicReport from "../components/sections/DynamicReport";
import { useAppContext } from "../context/AppContext";

const API_URL = "https://python-fm-dapi-weaver.onrender.com/api/dataApi";
const AUTH_HEADER = "Basic RGV2ZWxvcGVyOmFkbWluYml6";

// Custom hook for responsive scaling
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

const Preview: React.FC = () => {
  const { containerRef, contentRef, scale } = useResponsiveScale();
  const {
    level,
    reportJson,
    setTemplateID,
    setReportJson,
    setReportConfig,
    setReportSetup,
  } = useAppContext();
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Fetch template based on level
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const payload = {
          fmServer: "kibiz-linux.smtech.cloud",
          method: "findRecord",
          methodBody: {
            database: "KibiAIDemo",
            layout: "KibiAITemplates",
            limit: 10,
            dateformats: 0,
            query: [{ Level: level }],
          },
          session: {
            token: "",
            required: "",
            kill_session: true,
          },
        };

        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: AUTH_HEADER,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        // Handle null or no records
        if (
          !data.records ||
          data.records === null ||
          data.records.length === 0
        ) {
          console.warn("No templates found for this level:", level);
          setLoading(false);
          return;
        }

        // Randomly select a template
        const randomTemplate =
          data.records[Math.floor(Math.random() * data.records.length)];

        const templateID = randomTemplate.recordId;
        const reportJSON =
          randomTemplate.ReportJSON || randomTemplate.reportJSON || null;

        // Set values in global context
        setTemplateID(templateID);
        if (reportJSON) {
          const parsed =
            typeof reportJSON === "string"
              ? JSON.parse(reportJSON)
              : reportJSON;
          setReportJson(parsed);
        }

        setReportConfig(randomTemplate.ReportConfigJSON || null);
        setReportSetup(randomTemplate.SetupJSON || null);

        // // Optional placeholders if you plan to use them later
        // if (setReportConfig)
        //   setReportConfig(
        //     randomTemplate.ReportConfig || randomTemplate.reportConfig || null
        //   );
        // if (setReportSetup)
        //   setReportSetup(
        //     randomTemplate.ReportSetup || randomTemplate.reportSetup || null
        //   );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [level, setTemplateID, setReportJson, setReportConfig, setReportSetup]);

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center overflow-x-hidden overflow-y-auto">
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center w-full h-full px-6 py-12 lg:py-16 xl:py-2 max-w-2xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
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

        {/* Report Preview Section */}
        <div
          ref={containerRef}
          className="bg-gray-100 rounded-2xl shadow-md p-6 lg:p-8 w-full flex justify-center items-start overflow-hidden relative"
          style={{
            height: "60vh",
          }}
        >
          {loading ? (
            <div className="text-center text-[#5e17eb] font-semibold">
              Fetching report template for level {level}...
            </div>
          ) : reportJson ? (
            <div
              ref={contentRef}
              className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                transition: "transform 0.3s ease",
              }}
            >
              <DynamicReport jsonData={reportJson} />
            </div>
          ) : (
            <div className="text-center text-gray-600 font-semibold">
              No report template available for level {level}.
            </div>
          )}
        </div>

        {/* Caption */}
        <p className="text-[#5e17eb] text-center text-base lg:text-xl font-bold mt-6 mb-4 px-4 leading-snug">
          Preview of the report you need to write the prompt for
        </p>

        {/* Ready to Prompt Button */}
        <div className="mb-4">
          <button
            disabled={loading || !reportJson}
            className={`${
              loading || !reportJson
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5e17eb] hover:bg-purple-700"
            } text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-8 py-3 text-lg`}
            onClick={() => navigate("/generate-report")}
          >
            <img src={skeletonImage} alt="" className="h-6 lg:h-7" />
            <span>{loading ? "LOADING..." : "READY TO PROMPT"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Preview;
