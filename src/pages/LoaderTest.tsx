import { useState } from "react";
import AnimatedLoader from "../components/AnimatedLoader";

const LoaderTest = () => {
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(1);

  async function handleProcess() {
    setLoading(true);

    setStage(1);
    await new Promise((res) => setTimeout(res, 3500));

    setStage(2);
    await new Promise((res) => setTimeout(res, 3500));

    setStage(3);
    await new Promise((res) => setTimeout(res, 3500));

    setLoading(false);
  }

  return (
    <div
      className="flex flex-col items-center justify-center h-screen gap-4 bg-gray-900"
      style={{ width: "100vw", height: "100vh" }}
    >
      <button
        onClick={handleProcess}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Start Process
      </button>

      <AnimatedLoader processStart={loading} processStage={stage} />
    </div>
  );
};

export default LoaderTest;
