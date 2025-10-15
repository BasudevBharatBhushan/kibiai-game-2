import React, { useState, useEffect } from "react";
import kibiaiLogo from "../assets/images/kibiai.png";
import titleImage from "../assets/images/title.png";
import skeletonImage from "../assets/images/skeleton.png";
import kibizsystems from "../assets/images/kibizsystems.png";
import DynamicReport from "../components/sections/DynamicReport";
import { useAppContext } from "../context/AppContext";

// ✅ Environment Variables (from .env)
const ASSISTANT_API = import.meta.env.VITE_ASSISTANT_API;
const GENERATE_REPORT_API = import.meta.env.VITE_GENERATE_REPORT_API;
const FM_API = import.meta.env.VITE_FM_API;
const FM_AUTH = import.meta.env.VITE_FM_AUTH;
const VERCEL_BYPASS = import.meta.env.VITE_VERCEL_BYPASS;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;

const GenerateReport: React.FC = () => {
  const {
    reportSetup,
    setReportJson,
    setCustomReportConfig,
    userID,
    templateID,
  } = useAppContext();

  const [promptText, setPromptText] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadId, setThreadId] = useState<string>("");
  const [reportData, setReportData] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // disable background scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalOpen]);

  // auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const openModal = (data?: any, error?: string) => {
    if (error) setModalError(error);
    else setReportData(data);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalError(null);
    setReportData(null);
  };

  const buildAssistantPrompt = (userPrompt: string, setupJson: any) => {
    const today = new Date();
    const dateRef = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    return [
      "UserPrompt:",
      userPrompt,
      "",
      "SetupJSON:",
      typeof setupJson === "string" ? setupJson : JSON.stringify(setupJson),
      "",
      `ReferenceDate: ${dateRef}`,
      "",
      "Please return only a JSON string in `latestMessage` that contains the updated report_config.",
    ].join("\n");
  };

  const callAssistant = async (prompt: string) => {
    const body = {
      openAIKey: OPENAI_KEY,
      assistantId: ASSISTANT_ID,
      threadId: "",
      prompt,
    };

    const res = await fetch(ASSISTANT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vercel-protection-bypass": VERCEL_BYPASS,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Assistant API failed (${res.status})`);
    return res.json();
  };

  const callGenerateReport = async (setup: any, config: any) => {
    const res = await fetch(GENERATE_REPORT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-vercel-protection-bypass": VERCEL_BYPASS,
      },
      body: JSON.stringify({ report_setup: setup, report_config: config }),
    });
    if (!res.ok) throw new Error(`Generate-report failed (${res.status})`);
    return res.json();
  };

  const createSessionRecord = async (
    userPrompt: string,
    aiResponse: string
  ) => {
    const payload = {
      fmServer: "kibiz-linux.smtech.cloud",
      method: "createRecord",
      methodBody: {
        database: "KibiAIDemo",
        layout: "KiBiAISessions",
        record: {
          UserID: userID || "0",
          TemplateID: templateID ? String(templateID) : "1",
          UserPrompt: userPrompt,
          AIResponse: aiResponse,
          Score: 10,
          OpenAIThreadID: threadId,
        },
      },
      session: { token: "", required: "", kill_session: true },
    };

    const res = await fetch(FM_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: FM_AUTH,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`FM createSession failed (${res.status})`);
    return res.json();
  };

  const handleSubmit = async () => {
    if (!promptText.trim()) return alert("Please enter a prompt.");
    if (!reportSetup) return alert("Missing report setup.");

    setLoading(true);
    try {
      // 1️⃣ Assistant API
      const assistantPrompt = buildAssistantPrompt(promptText, reportSetup);
      const assistantRes = await callAssistant(assistantPrompt);
      const msg = assistantRes.latestMessage || "";
      const thread = assistantRes.threadId;
      setThreadId(thread);

      // parse message
      let parsedConfig: any;
      try {
        parsedConfig = JSON.parse(msg);
      } catch {
        const match = msg.match(/\{[\s\S]*\}$/);
        parsedConfig = match ? JSON.parse(match[0]) : null;
      }
      if (!parsedConfig) throw new Error("Invalid config from assistant");

      setCustomReportConfig(parsedConfig);

      // 2️⃣ Generate Report
      const generated = await callGenerateReport(reportSetup, parsedConfig);
      if (!generated || Object.keys(generated).length === 0)
        return openModal(undefined, "Invalid parameters generated for report.");

      setReportJson(generated);
      openModal(generated);

      // 3️⃣ Create Session in FM
      await createSessionRecord(promptText, msg);
      setToast("Session saved successfully.");
    } catch (err: any) {
      console.error(err);
      openModal(undefined, "Invalid parameters generated for report.");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Helper for displaying tables/relationships neatly
  const tables = (() => {
    try {
      if (!reportSetup) return [];
      const parsed =
        typeof reportSetup === "string" ? JSON.parse(reportSetup) : reportSetup;
      return parsed?.tables ? Object.keys(parsed.tables) : [];
    } catch {
      return [];
    }
  })();

  const relationships = (() => {
    try {
      if (!reportSetup) return [];
      const parsed =
        typeof reportSetup === "string" ? JSON.parse(reportSetup) : reportSetup;
      return parsed?.relationships || [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-center overflow-x-hidden overflow-y-auto">
      <div className="flex flex-col justify-between items-center w-full h-full px-6 py-12 lg:py-14 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-center gap-4 mb-4">
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

        {/* Main Input */}
        <div className="flex flex-col items-center justify-center flex-1 w-full mt-2 mb-6">
          <h1 className="text-2xl font-bold text-[#5e17eb] mb-6">
            PROMPT-SAURUS
          </h1>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            className="w-full h-36 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-[#5e17eb] text-gray-800 text-base"
            placeholder="Type your prompt here"
          />

          <button
            disabled={loading}
            onClick={handleSubmit}
            className={`mt-8 ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#5e17eb] hover:bg-purple-700"
            } text-white font-semibold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 px-8 py-3 text-lg`}
          >
            <img src={skeletonImage} alt="" className="h-6 lg:h-7" />
            <span>{loading ? "PROCESSING..." : "SUBMIT"}</span>
          </button>

          {/* Display Tables and Relationships */}
          <div className="w-full flex flex-col lg:flex-row justify-between gap-6 bg-gray-100 rounded-2xl p-6 shadow-md mt-8">
            <div className="flex-1">
              <h3 className="text-[#5e17eb] font-bold text-lg mb-4 text-center lg:text-left">
                TABLES
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {tables.length > 0 ? (
                  tables.map((table) => (
                    <div
                      key={table}
                      className="border-2 border-[#5e17eb] rounded-md h-8 flex items-center justify-center text-sm px-2"
                    >
                      {table}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm col-span-2">
                    No tables found
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-[#5e17eb] font-bold text-lg mb-4 text-center lg:text-left">
                RELATIONSHIPS
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {relationships.length > 0 ? (
                  relationships.map((r: any, i: number) => (
                    <div
                      key={i}
                      className="border-2 border-[#5e17eb] rounded-md h-8 flex items-center justify-center text-sm px-3"
                    >
                      {r.primary_table} → {r.joined_table || "<self>"}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No relationships found
                  </p>
                )}
              </div>
            </div>
          </div>
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

      {/* Modal Preview */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-60"
            onClick={closeModal}
          />
          <div className="relative w-full h-full overflow-auto p-6">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden min-h-[80vh]">
              <div className="flex items-center justify-between p-3 border-b">
                <h3 className="text-lg font-semibold text-[#5e17eb]">
                  Report Preview
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded-md"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 h-[calc(100vh-120px)] overflow-auto">
                {modalError ? (
                  <div className="text-center text-red-600 font-semibold">
                    {modalError}
                  </div>
                ) : reportData ? (
                  <DynamicReport jsonData={reportData} />
                ) : (
                  <div className="text-center text-gray-600">
                    No report data available.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 z-60 bg-white border rounded-md px-4 py-2 shadow-lg">
          <div className="text-sm font-medium">{toast}</div>
        </div>
      )}
    </div>
  );
};

export default GenerateReport;
