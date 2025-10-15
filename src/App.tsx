import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Report from "./pages/Report";
import Home from "./pages/Home";
import Preview from "./pages/Preview";
import Level from "./pages/Level";
import Instructions from "./pages/Instructions";
import GenerateReport from "./pages/GenerateReport";
import Score from "./pages/Score";
import UserForm from "./pages/UserForm";

function App() {
  return (
    <Router>
      {/* <Header /> */}
      <main className="">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/report" element={<Report />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/preview" element={<Preview />} />
          <Route path="/level" element={<Level />} />
          <Route path="/instructions" element={<Instructions />} />
          <Route path="/generate-report" element={<GenerateReport />} />
          <Route path="/score" element={<Score />} />
          <Route path="/user-form" element={<UserForm />} />
        </Routes>
      </main>
      {/* <Footer /> */}
    </Router>
  );
}

export default App;
