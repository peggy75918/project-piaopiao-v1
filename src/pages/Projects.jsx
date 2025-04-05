import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import styles from "./projects.module.css";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true); // 加入 loading 狀態避免跳轉錯誤
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProjects = async () => {
      const storedLineId = localStorage.getItem("line_id");
      if (!storedLineId) {
        console.error("❌ 找不到 `line_id`，可能尚未登入");
        setLoading(false);
        return;
      }

      console.log("📢 查詢 `project_members`...");
      const { data: projectMembers, error: projectError } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", storedLineId);

      if (projectError) {
        console.error("❌ 查詢 `project_members` 失敗", projectError);
        setLoading(false);
        return;
      }

      if (!projectMembers || projectMembers.length === 0) {
        console.warn("⚠️ 目前沒有加入任何專案");
        setLoading(false);
        return;
      }

      // 取得所有 project_id
      const projectIds = projectMembers.map(pm => pm.project_id);

      console.log("📢 查詢 `projects` 資料...");
      const { data: projects, error: projectError2 } = await supabase
        .from("projects")
        .select("id, name")
        .in("id", projectIds); // 查詢這些專案的名稱

      if (projectError2) {
        console.error("❌ 查詢 `projects` 失敗", projectError2);
        setLoading(false);
        return;
      }

      console.log("✅ 專案列表:", projects);
      setProjects(projects);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  const handleSelectProject = (projectId) => {
    console.log("🔗 選擇專案，導向 Home 頁面:", projectId);
    localStorage.setItem("project_id", projectId);
    navigate("/home"); // 進入專案頁面
  };

  if (loading) {
    return <p style={{ textAlign: "center" }}>⏳ 載入中...</p>;
  }

  return (
    <div className={styles.projectsContainer}>
      <p className={styles.projects_title}>選擇要進入的專案</p>
      {projects.length === 0 ? (
        <p>⚠️ 目前沒有加入任何專案</p>
      ) : (
        <ul>
          {projects.map((proj) => (
            <li key={proj.id} onClick={() => handleSelectProject(proj.id)}>
              {proj.name || "未命名專案"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Projects;




