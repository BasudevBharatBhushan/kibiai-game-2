import React from "react";
import { useNavigate } from "react-router-dom";
import skeletonImage from "../assets/images/skeleton.png";
import { useAppContext } from "../context/AppContext";
import Header from "../components/common/Header";
import Footer from "../components/common/Footer";

const Score: React.FC = () => {
  const navigate = useNavigate();
  const { score, userName } = useAppContext();

  // ✅ TEST JSON (Remove once done testing UI)
  const testScore = {
    score: 12,
    max_score: 15,
    level: "EASY",
    overview: {
      columns: { status: "matched", notes: "All columns match." },
      group_by: { status: "partial", notes: "Order differs." },
      filters: { status: "mismatch", notes: "Extra filter detected." },
      date_range: { status: "partial", notes: "End date mismatch." },
      sorting: { status: "matched", notes: "Sorting is correct." },
      joins: { status: "matched", notes: "All joins match properly." },
    },
    suggestions: [
      "Remove extra filter 'Region'.",
      "Align date range to match ideal report.",
    ],
  };

  // ✅ Using second JSON format (no score_json wrapper)
  const displayScoreJSON = score || testScore;
  const displayName = userName || "Explorer";
  const displayLevel = displayScoreJSON.level || "EASY";
  const numericScore = displayScoreJSON.score || 0;
  const overview = displayScoreJSON.overview || {};
  const suggestions = displayScoreJSON.suggestions || [];

  const statusBadgeColor = (status?: string) => {
    switch (status) {
      case "matched":
        return "bg-green-100 text-green-700";
      case "partial":
        return "bg-yellow-100 text-yellow-700";
      case "mismatch":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="w-screen min-h-screen bg-white flex justify-center items-start overflow-y-auto">
      <div className="flex flex-col justify-between items-center w-full min-h-screen px-6 py-8 lg:px-8 lg:py-10 xl:px-12 xl:py-12 max-w-3xl lg:max-w-4xl xl:max-w-5xl mx-auto">
        <Header />

        <div className="flex flex-col items-center justify-center flex-1 w-full mt-8 lg:mt-10 xl:mt-12 mb-8 lg:mb-10 xl:mb-12">

          {/* Score Card */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-3xl shadow-lg p-8 lg:p-10 xl:p-12 flex flex-col items-center justify-center text-center w-full max-w-lg lg:max-w-xl mb-10 lg:mb-12 xl:mb-14">
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-[#5e17eb] mb-3 lg:mb-4">
              Hello, {displayName}!
            </h1>
            <div className="inline-block bg-white px-5 py-2 rounded-full shadow-sm mb-6 lg:mb-8">
              <p className="text-gray-700 text-sm lg:text-base xl:text-lg font-semibold uppercase tracking-wider">
                Level: {displayLevel}
              </p>
            </div>

            <h2 className="text-lg lg:text-xl xl:text-2xl font-semibold text-gray-700 mb-3 lg:mb-4 uppercase tracking-wide">
              Total Points
            </h2>
            <div className="text-7xl lg:text-8xl xl:text-9xl font-extrabold text-[#5e17eb] mb-2 tracking-tight">
              {numericScore}
            </div>
            <p className="text-sm lg:text-base text-gray-500 font-medium">
              out of {displayScoreJSON.max_score}
            </p>
          </div>

          {/* Overview Section */}
          <div className="w-full max-w-2xl lg:max-w-3xl mb-10 lg:mb-12 xl:mb-14">
            <h3 className="text-2xl lg:text-3xl xl:text-3xl font-bold text-[#5e17eb] text-center mb-6 lg:mb-8 xl:mb-10 uppercase tracking-wide">
              Overview
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
              {Object.entries(overview).map(([key, value]: any) => (
                <div
                  key={key}
                  className="bg-white border border-gray-200 rounded-2xl p-5 lg:p-6 xl:p-7 shadow-md hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-3 lg:mb-4">
                    <p className="font-bold text-gray-800 text-base lg:text-lg xl:text-xl uppercase tracking-wide">
                      {key.replace(/_/g, " ")}
                    </p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs lg:text-sm font-semibold uppercase ${statusBadgeColor(
                        value?.status
                      )}`}
                    >
                      {value?.status || "unknown"}
                    </span>
                  </div>
                  <p className="text-sm lg:text-base text-gray-600 leading-relaxed">
                    {value?.notes || "No notes"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="w-full max-w-2xl lg:max-w-3xl mb-10 lg:mb-12 xl:mb-14">
              <h3 className="text-2xl lg:text-3xl xl:text-3xl font-bold text-[#5e17eb] text-center mb-6 lg:mb-8 xl:mb-10 uppercase tracking-wide">
                Suggestions
              </h3>
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 lg:p-7 xl:p-8 shadow-md">
                <ul className="space-y-3 lg:space-y-4">
                  {suggestions.map((s: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-gray-700 text-sm lg:text-base xl:text-lg leading-relaxed"
                    >
                      <span className="flex items-center justify-center w-6 h-6 lg:w-7 lg:h-7 rounded-full bg-[#5e17eb] text-white font-bold text-xs lg:text-sm">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Try Again */}
          <button
            className="bg-[#5e17eb] hover:bg-purple-700 text-white font-bold rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-3 lg:gap-4 px-10 py-4 lg:px-12 lg:py-5 xl:px-14 xl:py-5 text-lg lg:text-xl xl:text-xl"
            onClick={() => navigate("/")}
          >
            <img src={skeletonImage} alt="" className="h-6 lg:h-7 xl:h-8" />
            <span>TRY AGAIN</span>
          </button>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default Score;
