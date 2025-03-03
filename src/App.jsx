import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from './pages/Home'
import Tasklist from './pages/Tasklist'
import Progress from './pages/Progress'
import Cloud from './pages/Cloud'
import Suggestion from './pages/Suggestion'
import Notification from './pages/Notification'
import Personal from './pages/Personal'
import './App.css'

import { useEffect, useState } from "react";
import { initLiff } from "./utils/liff";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const storedLineId = localStorage.getItem("line_id");
      
      if (storedLineId) {
        console.log("✅ 使用已儲存的 LINE ID:", storedLineId);
        return; // 如果已經有 line_id，就不重新登入
      }

      const userInfo = await initLiff();
      if (userInfo) {
        setUser(userInfo);
      }
    };

    checkUser();
  }, []);

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/tasklist' element={<Tasklist />} />
          <Route path='/progress' element={<Progress />} />
          <Route path='/cloud' element={<Cloud />} />
          <Route path='/suggestion' element={<Suggestion />} />
          <Route path='/notification' element={<Notification />} />
          <Route path='/personal' element={<Personal />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
