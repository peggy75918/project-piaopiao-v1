import { MemoryRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import Home from './pages/Home';
import Projects from "./pages/Projects";
import Tasklist from './pages/Tasklist';
import Progress from './pages/Progress';
import Cloud from './pages/Cloud';
import Suggestion from './pages/Suggestion';
import Notification from './pages/Notification';
import Personal from './pages/Personal';
import { useEffect, useState } from "react";
import { initLiff } from "./utils/liff";
import { Spin } from "antd"; // ✅ 加入 Ant Design 的 Loading Spinner
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ 加入 loading 狀態

  useEffect(() => {
    const checkUser = async () => {
      const storedLineId = localStorage.getItem("line_id");
      
      if (storedLineId) {
        console.log("✅ 使用已儲存的 LINE ID:", storedLineId);
        setLoading(false); // ✅ 完成後關閉 Loading
        return; 
      }

      const userInfo = await initLiff();
      if (userInfo) {
        setUser(userInfo);
      }

      setLoading(false); // ✅ 確保完成後關閉 Loading
    };

    checkUser();
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Spin size="large" /> {/* ✅ 使用 Ant Design 的 Loading Spinner */}
      </div>
    );
  }

  return (
    <MemoryRouter>
      <Routes>
        <Route path="/" element={<Projects />} />{/* 預設進入專案選擇頁 */}
        <Route path="/projects" element={<Projects />} />
        <Route path="/home" element={<Home />} />
        <Route path="/tasklist/:projectId" element={<Tasklist />} />
        <Route path='/progress' element={<Progress />} />
        <Route path='/progress/:projectId' element={<Progress />} />
        <Route path='/cloud' element={<Cloud />} />
        <Route path='/suggestion' element={<Suggestion />} />
        <Route path='/notification' element={<Notification />} />
        <Route path='/personal' element={<Personal />} />
      </Routes>
    </MemoryRouter>
  );
}

export default App;
