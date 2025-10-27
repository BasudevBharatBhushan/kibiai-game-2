import React, { createContext, useState, useContext } from "react";

// Create context
const AppContext = createContext<any>(null);

// Provider component
export function AppProvider({ children }: { children: React.ReactNode }) {
  // Global state variables
  const [userID, setUserID] = useState("");
  const [userName, setUserName] = useState("");
  const [level, setLevel] = useState("EASY");
  const [score, setScore] = useState(0);
  const [templateID, setTemplateID] = useState(1);
  const [reportJson, setReportJson] = useState(null);
  const [reportSetup, setReportSetup] = useState(null);
  const [reportConfig, setReportConfig] = useState(null);
  const [customReportConfig, setCustomReportConfig] = useState(null);
  const [isReportGenerated, setIsReportGenerated] = useState(false);

  // Function to check and restore session
  const isUserSignedIn = (): boolean => {
    try {
      const stored = localStorage.getItem("kibiai_user");
      if (!stored) return false;

      const { userData, expiry } = JSON.parse(stored);
      const isValid = expiry && new Date(expiry) > new Date();

      if (isValid && userData) {
        // Restore user details into global state
        if (userData.recordId) setUserID(userData.recordId.toString());
        if (userData.Name) setUserName(userData.Name);
        return true;
      } else {
        // Expired or invalid
        localStorage.removeItem("kibiai_user");
        return false;
      }
    } catch (err) {
      console.error("Error checking user session:", err);
      return false;
    }
  };

  // Values accessible everywhere
  const value = {
    userID,
    setUserID,
    userName,
    setUserName,
    level,
    setLevel,
    score,
    setScore,
    templateID,
    setTemplateID,
    isUserSignedIn,
    reportJson,
    setReportJson,
    reportSetup,
    setReportSetup,
    reportConfig,
    setReportConfig,
    customReportConfig,
    setCustomReportConfig,
    isReportGenerated,
    setIsReportGenerated,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Custom hook for easy access
export function useAppContext() {
  return useContext(AppContext);
}
