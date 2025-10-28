import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import skeletonImage from "../assets/images/skeleton.png";
import DynamicReport from "../components/sections/DynamicReport";
import { useAppContext } from "../context/AppContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const API_URL = "https://python-fm-dapi-weaver.onrender.com/api/dataApi";
const AUTH_HEADER = "Basic RGV2ZWxvcGVyOmFkbWluYml6";

const Preview: React.FC = () => {
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
          console.warn("No templates found for this level:", level);
          setLoading(false);
          return;
        }

        const randomTemplate =
          data.records[Math.floor(Math.random() * data.records.length)];

        const templateID = randomTemplate.recordId;
        const reportJSON =
          randomTemplate.ReportJSON || randomTemplate.reportJSON || null;

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
    <div className="w-full min-h-screen bg-white flex flex-col items-center overflow-x-hidden overflow-y-auto p-4 lg:p-6">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        {/* Header */}
        <Header />

        {/* Report Container */}
        <div
          className="bg-gray-50 rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          style={{
            height: "calc(100vh - 300px)",
            minHeight: "500px",
            maxHeight: "800px",
          }}
        >
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-[#5e17eb] font-semibold p-6">
                Loading {level} Level Report...
              </div>
            </div>
          ) : reportJson ? (
            <div
              className="w-full h-full overflow-auto p-2 lg:p-4  [&::-webkit-scrollbar]:w-1.5 
  [&::-webkit-scrollbar-thumb]:bg-gray-50 
  [&::-webkit-scrollbar-thumb:hover]:bg-gray-100 
  [&::-webkit-scrollbar-track]:bg-transparent 
  [scrollbar-width:thin]"
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

        {/* Title */}
        <p className="text-[#5e17eb] text-center text-base xl:text-xl font-bold mt-6 mb-4">
          Preview of your {level} Level Report
        </p>

        {/* Action Button */}
        <div className="w-full flex justify-center mt-6 mb-8">
          <button
            disabled={loading || !reportJson}
            onClick={() => navigate("/generate-report")}
            className={`${
              loading || !reportJson
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5e17eb] hover:bg-purple-700 transform hover:scale-105 transition-transform"
            } text-white font-semibold rounded-full shadow-lg px-6 py-3 text-base lg:px-8 lg:py-3 xl:text-lg flex items-center gap-2 lg:gap-3`}
          >
            <img src={skeletonImage} className="h-5 lg:h-6 xl:h-7" alt="" />
            {loading ? "LOADING..." : "READY TO PROMPT"}
          </button>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Preview;
