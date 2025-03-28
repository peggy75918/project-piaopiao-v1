import { MemoryRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Projects from "./pages/Projects";
import Tasklist from './pages/Tasklist';
import Progress from './pages/Progress';
import Cloud from './pages/Cloud';
import Suggestion from './pages/Suggestion';
import Notification from './pages/Notification';
import Personal from './pages/Personal';
import MemberProfile from "./pages/MemberProfile";
import { useEffect, useState } from "react";
import { initLiff } from "./utils/liff";
import { Spin } from "antd";
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const storedLineId = localStorage.getItem("line_id");
      const storedProjectId = localStorage.getItem("project_id");

      if (storedLineId && storedProjectId) {
        console.log("✅ 已找到 LINE ID 與 Project ID");
        setLoading(false);
        return;
      }

      const userInfo = await initLiff();
      if (userInfo) {
        setUser(userInfo);
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Projects />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tasklist/:projectId" element={<Tasklist />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/progress/:projectId" element={<Progress />} />
        <Route path="/cloud" element={<Cloud />} />
        <Route path="/cloud/:projectId" element={<Cloud />} />
        <Route path="/suggestion" element={<Suggestion />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/personal" element={<Personal />} />
        <Route path="/memberprofile" element={<MemberProfile />} />
        <Route path="/memberprofile/:projectId" element={<MemberProfile />} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;

