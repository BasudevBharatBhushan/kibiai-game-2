import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images
import skeletonImage from "../assets/images/skeleton.png";
import DynamicReport from "../components/sections/DynamicReport";
import { useAppContext } from "../context/AppContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

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
    isReportGenerated,
    setIsReportGenerated,
  } = useAppContext();
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch template based on level
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
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
        setIsReportGenerated(true);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setLoading(false);
      }
    };

    if (!isReportGenerated) {
      fetchTemplate();
    }
  }, [level, setTemplateID, setReportJson, setReportConfig, setReportSetup]);

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center overflow-x-hidden overflow-y-auto">
      <div className="grid grid-rows-[auto_1fr_auto] items-center justify-items-center w-full h-full px-6 py-6 lg:py-10 xl:py-2 max-w-2xl mx-auto">
        {/* Header Section */}
        <Header />

        <div
          ref={containerRef}
          className="
    bg-gray-100 rounded-sm shadow-md w-full flex justify-center items-start
    h-[70vh]         
    xl:h-[800px]       
    overflow-hidden   
  "
        >
          {loading ? (
            <div className="text-center text-[#5e17eb] font-semibold p-10">
              Loading {level} Level Report...
            </div>
          ) : reportJson ? (
            <div
              ref={contentRef}
              className="w-full h-full overflow-hidden"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                transition: "transform .3s ease",
              }}
            >
              <DynamicReport jsonData={reportJson} />
            </div>
          ) : (
            <div className="text-center text-gray-600 font-semibold">
              No report template found.
            </div>
          )}
        </div>

        <p className="text-[#5e17eb] text-center text-base lg:text-xl font-bold mt-6 mb-4">
          Preview of your Medium Level Report
        </p>

        <button
          disabled={loading || !reportJson}
          onClick={() => navigate("/generate-report")}
          className={`${
            loading || !reportJson
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-[#5e17eb] hover:bg-purple-700"
          } text-white font-semibold rounded-full shadow-lg px-8 py-3 text-lg flex items-center gap-3`}
        >
          <img src={skeletonImage} className="h-6 lg:h-7" />
          {loading ? "LOADING..." : "READY TO PROMPT"}
        </button>

        <Footer />
      </div>
    </div>
  );
};

export default Preview;
