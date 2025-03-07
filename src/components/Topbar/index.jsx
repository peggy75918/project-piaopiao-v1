import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom"; // 加入 useLocation 來判斷當前頁面
import { supabase } from "../../lib/supabase";
import { initLiff } from "../../utils/liff";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import styles from "./topbar.module.css";

const Topbar = ({ projectId: propProjectId }) => {
  const { projectId: paramProjectId } = useParams();
  const location = useLocation(); // 取得當前路徑
  const [projectName, setProjectName] = useState("專案名稱");
  const [user, setUser] = useState(null);
  const [visible, setVisible] = useState(false);

  // 優先使用 `propProjectId`，否則從 `useParams()` 或 `localStorage` 獲取
  const finalProjectId = propProjectId || paramProjectId || localStorage.getItem("project_id");

  useEffect(() => {
    const fetchUser = async () => {
      const userInfo = await initLiff();
      if (userInfo) setUser(userInfo);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchProjectName = async () => {
      if (!finalProjectId) return;
      
      const { data, error } = await supabase
        .from("projects")
        .select("name")
        .eq("id", finalProjectId)
        .maybeSingle();

      if (error) {
        console.error("❌ 讀取專案名稱失敗", error);
      } else if (data) {
        setProjectName(data.name);
      }
    };

    fetchProjectName();
  }, [finalProjectId]);

  return (
    <div className={styles.topbar}>
      <button onClick={() => setVisible(true)} className={styles.topbar_btn}>
        <MenuUnfoldOutlined />
      </button>

      <p className={styles.topbar_project_name}>{projectName}</p>
      <div className={styles.topbar_space}></div>

      {visible && (
        <div className={styles.topbar_drawer}>
          <div className={styles.topbar_drawerHeader}>
            <h2> </h2>
            <button onClick={() => setVisible(false)}>✖</button>
          </div>

          <div className={styles.topbar_userProfile}>
            {user && (
              <>
                <img src={user.picture} alt="頭像" className={styles.topbar_userAvatar} />
                <p className={styles.topbar_welcomeText}>歡迎, {user.name}</p>
              </>
            )}
          </div>
          <div className={styles.topbar_line}></div>

          <ul className={styles.topbar_menu}>
            <li
              style={location.pathname === "/home" ? { backgroundColor: "#89a8b2", color: "white" } : {}}
            >
              <Link to={`/home`} style={location.pathname === "/home" ? { color: "white" } : {}}>
                專案首頁
              </Link>
            </li>
            <li
              style={location.pathname === `/tasklist/${finalProjectId}` ? { backgroundColor: "#89a8b2", color: "white" } : {}}
            >
              <Link to={`/tasklist/${finalProjectId}`} style={location.pathname === `/tasklist/${finalProjectId}` ? { color: "white" } : {}}>
                任務清單
              </Link>
            </li>
            <li
              style={location.pathname === "/progress" ? { backgroundColor: "#89a8b2", color: "white" } : {}}
            >
              <Link to={`/progress`} style={location.pathname === "/progress" ? { color: "white" } : {}}>
                進度追蹤
              </Link>
            </li>
            <li
              style={location.pathname === "/cloud" ? { backgroundColor: "#89a8b2", color: "white" } : {}}
            >
              <Link to={`/cloud`} style={location.pathname === "/cloud" ? { color: "white" } : {}}>
                共用雲端
              </Link>
            </li>
            <li
              style={location.pathname === "/suggestion" ? { backgroundColor: "#89a8b2", color: "white" } : {}}
            >
              <Link to={`/suggestion`} style={location.pathname === "/suggestion" ? { color: "white" } : {}}>
                建議箱
              </Link>
            </li>
            <li
              style={location.pathname === "/notification" ? { backgroundColor: "#89a8b2", color: "white" } : {}}
            >
              <Link to={`/notification`} style={location.pathname === "/notification" ? { color: "white" } : {}}>
                通知設定
              </Link>
            </li>
            <li
              style={location.pathname === "/personal" ? { backgroundColor: "#89a8b2", color: "white" } : {}}
            >
              <Link to={`/personal`} style={location.pathname === "/personal" ? { color: "white" } : {}}>
                個人專案管理
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Topbar;


