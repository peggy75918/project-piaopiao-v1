import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Topbar from '../components/Topbar';
import ProjectSummary from '../components/ProjectSummary';
import ProjectContribution from '../components/ProjectContribution';
import styles from './personal.module.css';

function Personal() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lineId, setLineId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const lineIdStored = localStorage.getItem("line_id");
    if (!lineIdStored) {
      console.error("❌ line_id 不存在，請先登入");
      setLoading(false);
      return;
    }
    setLineId(lineIdStored);

    const fetchProjects = async () => {
      const lineIdStored = localStorage.getItem("line_id");
      const currentProjectId = localStorage.getItem("project_id");
    
      if (!lineIdStored) {
        console.error("❌ line_id 不存在，請先登入");
        setLoading(false);
        return;
      }
      setLineId(lineIdStored);
    
      const { data: memberData, error } = await supabase
        .from("project_members")
        .select("project_id")
        .eq("user_id", lineIdStored);
    
      if (error || !memberData) {
        console.error("❌ 無法讀取專案成員資料", error);
        setLoading(false);
        return;
      }
    
      const projectIds = memberData.map(pm => pm.project_id);
    
      const { data: projectList, error: projectErr } = await supabase
        .from("projects")
        .select("id, name, is_completed, completed_at, group_id")
        .in("id", projectIds);
    
      if (projectErr) {
        console.error("❌ 無法讀取專案列表", projectErr);
        setLoading(false);
        return;
      }
    
      // ✅ 將當前專案排到最上方
      const sorted = projectList.sort((a, b) => {
        if (a.id === currentProjectId) return -1;
        if (b.id === currentProjectId) return 1;
        return 0;
      });
    
      setProjects(sorted);
      setLoading(false);
    };    

    fetchProjects();
  }, []);

  const handleSwitchProject = (projectId) => {
    localStorage.setItem("project_id", projectId);
    console.log("✅ 切換至專案", projectId);
    navigate("/home");
  };

  const handleToggleComplete = async (projectId, currentStatus) => {
    const updates = currentStatus
      ? { is_completed: false, completed_at: null }
      : { is_completed: true, completed_at: new Date().toISOString() };

    const { error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", projectId);

    if (!error) {
      setProjects(prev => prev.map(p =>
        p.id === projectId ? { ...p, ...updates } : p
      ));
    } else {
      alert("❌ 更新專案狀態失敗");
    }
  };

  const handleGenerateReport = async (projectId, groupId) => {
    const confirmSend = window.confirm("是否將此專案的總結報表傳送至聊天室？");
    if (!confirmSend) return;
  
    try {
      const res = await fetch("https://line-bot-project.vercel.app/send_project_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId, group_id: groupId })
      });
  
      const result = await res.json();
      if (result.success) {
        alert("✅ 專案總結報表已成功傳送！");
      } else {
        alert("❌ 傳送失敗：" + result.message);
      }
    } catch (err) {
      console.error("❌ 發送錯誤：", err);
      alert("❌ 發生錯誤，請稍後再試！");
    }
  };

  return (
    <div>
      <Topbar />
      <div className={styles.personalContainer}>
        {loading ? (
          <p style={{ textAlign: "center" }}>⏳ 載入中...</p>
        ) : projects.length === 0 ? (
          <p>⚠️ 尚未加入任何專案</p>
        ) : (
          <div className={styles.personal_cards}>
            {projects.map((proj) => (
              <div key={proj.id} className={styles.personal_card}>
                <div className={styles.personal_header}>
                  <p className={styles.personal_projname}>
                    {proj.name}{proj.is_completed ? "（已完成）" : ""}
                  </p>
                  <div className={styles.personal_toggle_group}>
                    {!proj.is_completed && (
                      <label className={styles.personal_toggle_label}>完成此專案</label>
                    )}
                    <label className={styles.personal_switch}>
                      <input
                        type="checkbox"
                        checked={proj.is_completed}
                        onChange={() => handleToggleComplete(proj.id, proj.is_completed)}
                      />
                      <span className={styles.personal_slider}></span>
                    </label>
                  </div>
                </div>

                {lineId && (
                  <>
                    <ProjectSummary projectId={proj.id} currentUser={lineId} />
                    <ProjectContribution projectId={proj.id} currentUser={lineId} />
                  </>
                )}

                <div className={styles.personal_btnGroup}>
                  <button
                    className={styles.personal_btn}
                    onClick={() => handleSwitchProject(proj.id)}
                  >
                    前往專案
                  </button>

                  {proj.is_completed && (
                    <button
                      className={styles.personal_report_btn}
                      onClick={() => handleGenerateReport(proj.id, proj.group_id)}
                    >
                      生成專案總結報表
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Personal;



