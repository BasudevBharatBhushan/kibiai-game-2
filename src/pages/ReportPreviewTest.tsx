import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import skeletonImage from "../assets/images/skeleton.png";

import DynamicReport from "../components/sections/DynamicReport";
import { useAppContext } from "../context/AppContext";
import Header from "../components/common/Header";

const API_URL = "https://python-fm-dapi-weaver.onrender.com/api/dataApi";
const AUTH_HEADER = "Basic RGV2ZWxvcGVyOmFkbWluYml6";

// Responsive Scaling Hook
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

const ReportPreviewTest: React.FC = () => {
  const level = "Medium"; // FIXED LEVEL
  const navigate = useNavigate();
  const { containerRef, contentRef, scale } = useResponsiveScale();
  const {
    setTemplateID,
    setReportJson,
    setReportConfig,
    setReportSetup,
    reportJson,
  } = useAppContext();

  const [loading, setLoading] = useState(true);

  // Load from cache or API
  useEffect(() => {
    const cached = localStorage.getItem("report_test_medium");

    if (cached) {
      console.log("✅ Loaded from LocalStorage");
      const parsed = JSON.parse(cached);
      setTemplateID(parsed.templateID);
      setReportJson(parsed.reportJson);
      setReportConfig(parsed.reportConfig);
      setReportSetup(parsed.reportSetup);
      setLoading(false);
      return;
    }

    // If no cache → Fetch once
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
          session: { token: "", required: "", kill_session: true },
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
        if (!data.records || data.records.length === 0) {
          setLoading(false);
          return;
        }

        const randomTemplate =
          data.records[Math.floor(Math.random() * data.records.length)];

        const templateID = randomTemplate.recordId;
        const reportJSON =
          randomTemplate.ReportJSON || randomTemplate.reportJSON || null;

        const parsedJSON =
          typeof reportJSON === "string" ? JSON.parse(reportJSON) : reportJSON;

        // Save in context
        setTemplateID(templateID);
        setReportJson(parsedJSON);
        setReportConfig(randomTemplate.ReportConfigJSON || null);
        setReportSetup(randomTemplate.SetupJSON || null);

        // Save in cache
        localStorage.setItem(
          "report_test_medium",
          JSON.stringify({
            templateID,
            reportJson: parsedJSON,
            reportConfig: randomTemplate.ReportConfigJSON || null,
            reportSetup: randomTemplate.SetupJSON || null,
          })
        );

        console.log("✅ Fetched & Saved to LocalStorage");
        setLoading(false);
      } catch (error) {
        console.error("Error fetching templates:", error);
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [level, setTemplateID, setReportJson, setReportConfig, setReportSetup]);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col items-center overflow-x-hidden overflow-y-auto p-4 md:p-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <Header />
        <div 
          ref={containerRef}
          className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          style={{
            height: 'calc(100vh - 300px)',
            minHeight: '500px',
            maxHeight: '800px',
          }}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-[#5e17eb] font-semibold p-6">
                Loading Medium Level Report...
              </div>
            </div>
          ) : reportJson ? (
            <div
              ref={contentRef}
              className="w-full h-full overflow-auto p-2 md:p-4"
              style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.3s ease',
              }}
            >
              <DynamicReport jsonData={reportJson} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-600 font-semibold p-6">
                No report template found.
              </div>
            </div>
          )}
        </div>
        <p className="text-[#5e17eb] text-center text-base lg:text-xl font-bold mt-6 mb-4">
          Preview of your Medium Level Report
        </p>

        <div className="w-full flex justify-center mt-6 mb-8">
          <button
            disabled={loading || !reportJson}
            onClick={() => navigate("/generate-report")}
            className={`${
              loading || !reportJson
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5e17eb] hover:bg-purple-700 transform hover:scale-105 transition-transform"
            } text-white font-semibold rounded-full shadow-lg px-6 py-3 text-base sm:px-8 sm:py-3 sm:text-lg flex items-center gap-2 sm:gap-3`}
          >
            <img src={skeletonImage} className="h-5 sm:h-6 md:h-7" alt="" />
            {loading ? "LOADING..." : "READY TO PROMPT"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportPreviewTest;
 