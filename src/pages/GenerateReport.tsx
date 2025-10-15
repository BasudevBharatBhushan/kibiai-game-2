import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
// const VERCEL_BYPASS = import.meta.env.VITE_VERCEL_BYPASS;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;
const ASSISTANT_ID = import.meta.env.VITE_ASSISTANT_ID;

const GenerateReport: React.FC = () => {
  const navigate = useNavigate();
  const {
    reportSetup,
    setReportJson,
    setCustomReportConfig,
    userID,
    templateID,
    // reportConfig,

    setScore,

    level,
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
        // "x-vercel-protection-bypass": VERCEL_BYPASS,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error(`Assistant API failed (${res.status})`);
    return res.json();
  };

  const callGenerateReport = async (setup: any, config: any) => {
    // 🧠 Normalize setup: ensure it's a plain JS object
    let normalizedSetup;
    try {
      normalizedSetup = typeof setup === "string" ? JSON.parse(setup) : setup;
    } catch (err) {
      console.error("Invalid setup JSON passed:", err);
      throw new Error("Invalid report_setup JSON format.");
    }

    // 🧩 Fix: ensure db_defination always has joined_table (empty string if missing)
    const fixedConfig = {
      ...config,
      db_defination: (config.db_defination || []).map((def: any) => ({
        joined_table: def.joined_table ?? "",
        ...def, // spread after ensures other fields override defaults if present
      })),
    };

    const generateReportPayload = {
      report_setup: normalizedSetup,
      report_config: fixedConfig,
    };

    console.log("Generate Report Payload:", generateReportPayload);

    // 📨 Send to backend (stringify once here)
    const res = await fetch(GENERATE_REPORT_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // "x-vercel-protection-bypass": VERCEL_BYPASS,
      },
      body: JSON.stringify(generateReportPayload),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Generate-report error:", errText);
      throw new Error(`Generate-report failed (${res.status})`);
    }

    return res.json();
  };

  const createSessionRecord = async (
    userPrompt: string,
    aiResponse: string,
    score: number
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
          Score: score,
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

  // 🔍 Compare ideal vs user report configs and get numeric score
  const compareReportsAndGetScore = async (
    level: string,
    idealReportConfig: any,
    userReportConfig: any
  ) => {
    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "You are a Report Comparison AI that evaluates the similarity between two JSON-based report queries. The goal is to determine how accurately the user's report query matches the ideal report configuration, considering structure, filters, joins, groupings, and sorting. Ignore titles and user-facing texts like 'report_header' or 'response_to_user'.",
              },
              {
                role: "user",
                content: `Compare the following report queries and return a score according to the level. Return only the score, no explanation.\n\nLEVEL: ${level}\n\nreportConfig:\n${JSON.stringify(
                  idealReportConfig,
                  null,
                  2
                )}\n\nuserReportConfig:\n${JSON.stringify(
                  userReportConfig,
                  null,
                  2
                )}`,
              },
            ],
            tools: [
              {
                type: "function",
                function: {
                  name: "ReportSimilarityScore",
                  description:
                    "Determines the similarity score between two report configuration JSONs (ideal vs user-generated).",
                  parameters: {
                    type: "object",
                    properties: {
                      score: {
                        type: "number",
                        description:
                          "Final similarity score. Max depends on level: EASY=10, MEDIUM=35, HARD=50, EXPERT=100.",
                      },
                      level: {
                        type: "string",
                        enum: ["EASY", "MEDIUM", "HARD", "EXPERT"],
                        description: "Report complexity level.",
                      },
                    },
                    required: ["score", "level"],
                  },
                },
              },
            ],
            tool_choice: "auto",
          }),
        }
      );

      if (!response.ok)
        throw new Error(`OpenAI Evaluation API failed (${response.status})`);

      const data = await response.json();

      // ✅ Handle the tool_call style response
      const toolCall =
        data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;

      if (!toolCall) {
        console.warn("Unexpected OpenAI response format:", data);
        return 0;
      }

      // Parse the stringified JSON safely
      const parsedArgs = JSON.parse(toolCall);
      const numericScore = parsedArgs?.score;

      if (typeof numericScore !== "number" || isNaN(numericScore)) {
        console.warn("Invalid score extracted:", parsedArgs);
        return 0;
      }

      // 🧮 Clamp score based on level to prevent overshooting
      const maxScores: Record<string, number> = {
        EASY: 10,
        MEDIUM: 35,
        HARD: 50,
        EXPERT: 100,
      };
      const max = maxScores[level.toUpperCase()] ?? 10;
      const finalScore = Math.min(Math.max(numericScore, 0), max);

      console.log(
        `✅ Score evaluated: ${finalScore}/${max} for level ${level}`
      );

      return finalScore;
    } catch (err) {
      console.error("Error comparing reports:", err);
      return 0;
    }
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

      // 🧮 3️⃣ Evaluate Score
      const score = await compareReportsAndGetScore(
        level, // make sure `level` is available from context
        parsedConfig, // ideal (AI-generated config)
        parsedConfig // placeholder; replace with user config if applicable
      );
      setScore(score);
      console.log("AI Evaluation Score:", score);

      // ✅ Navigate to report preview page
      navigate("/report-preview");

      // 4️⃣ Create Session in FM
      await createSessionRecord(promptText, msg, score);
      setToast(`Session saved successfully with score ${score}.`);

      navigate("/report-preview");
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

  console.log(tables, relationships);

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

          {/* 🧭 Tables & Relationships Visualization */}
          <div className="w-full bg-gray-100 rounded-2xl p-6 shadow-md mt-8">
            <h3 className="text-[#5e17eb] font-bold text-lg mb-4 text-center">
              DATABASE STRUCTURE
            </h3>

            {(() => {
              try {
                if (!reportSetup)
                  return (
                    <p className="text-gray-500 text-sm text-center">
                      No setup found
                    </p>
                  );

                const parsed =
                  typeof reportSetup === "string"
                    ? JSON.parse(reportSetup)
                    : reportSetup;

                const tables = parsed.tables || {};
                const relationships = parsed.relationships || [];

                // 🎨 Relationship color mapping
                const colorPalette = [
                  "#E57373", // red
                  "#64B5F6", // blue
                  "#81C784", // green
                  "#BA68C8", // purple
                  "#FFD54F", // yellow
                  "#4DD0E1", // cyan
                  "#A1887F", // brownish
                  "#F06292", // pink
                ];

                const fieldColorMap: Record<string, string> = {};
                relationships.forEach((rel: any, idx: number) => {
                  const color = colorPalette[idx % colorPalette.length];
                  if (rel.source)
                    fieldColorMap[`${rel.primary_table}.${rel.source}`] = color;
                  if (rel.target)
                    fieldColorMap[`${rel.joined_table}.${rel.target}`] = color;
                });

                return (
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(tables).map(
                      ([tableName, tableData]: any) => {
                        const fields = tableData.fields
                          ? Object.keys(tableData.fields)
                          : [];

                        return (
                          <div
                            key={tableName}
                            className="bg-white rounded-xl border border-[#5e17eb] shadow-sm p-4 flex flex-col"
                          >
                            <h4 className="text-[#5e17eb] font-bold text-center mb-2 text-lg">
                              {tableName}
                            </h4>

                            <div className="max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                              {fields.length > 0 ? (
                                fields.map((field) => {
                                  const fieldKey = `${tableName}.${field}`;
                                  const color = fieldColorMap[fieldKey];
                                  return (
                                    <div
                                      key={field}
                                      className={`px-2 py-1 text-sm rounded-md mb-1 border ${
                                        color ? "text-white" : "text-gray-700"
                                      }`}
                                      style={{
                                        backgroundColor: color || "transparent",
                                        borderColor: color || "#ddd",
                                        transition:
                                          "background-color 0.2s ease-in-out",
                                      }}
                                    >
                                      {field}
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-gray-400 text-xs text-center">
                                  No fields
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                );
              } catch (err) {
                console.error("Error rendering tables:", err);
                return (
                  <p className="text-red-500 text-sm text-center">
                    Error parsing setup JSON
                  </p>
                );
              }
            })()}
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
                  <DynamicReport key={Date.now()} jsonData={reportData} />
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
