import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";
import { EditOutlined, CheckOutlined } from "@ant-design/icons";

import imgwall from "../assets/鼓勵牆.png";
import imgtasklist from "../assets/任務清單.png";
import imgprogressRate from "../assets/進度追蹤.png";
import imgcloud from "../assets/資料共享.png";
import imgsuggestion from "../assets/建議箱.png";
import imgnotification from "../assets/專案成員資料3.png";
import imgpersonal from "../assets/個人專案管理.png";
import styles from "./home.module.css";

function Home() {
  const [user, setUser] = useState(null);
  const [project, setProject] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const [progress, setProgress] = useState(0);
  const displayedProgress = progress; 
  const maskHeight = `${100 - Math.floor(progress / 10) * 10}%`;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const storedLineId = localStorage.getItem("line_id");
      const storedProjectId = localStorage.getItem("project_id");
  
      if (!storedLineId || !storedProjectId) {
        console.warn("❌ 缺少 line_id 或 project_id，返回 Projects 頁面");
        navigate("/projects");
        return;
      }
  
      // 🔹 先查 user
      const { data: userData } = await supabase
        .from("users")
        .select("line_id, name, picture")
        .eq("line_id", storedLineId)
        .maybeSingle();
      if (userData) setUser(userData);
  
      // 🔹 查 project
      const { data: projectData } = await supabase
        .from("projects")
        .select("id, name")
        .eq("id", storedProjectId)
        .maybeSingle();
  
      if (!projectData) {
        console.warn("⚠️ 找不到 project，返回 Projects 頁面");
        navigate("/projects");
        return;
      }
  
      setProject(projectData);
      setNewProjectName(projectData.name);
      await calculateProjectProgress(projectData.id);
      setIsInitialized(true); // ✅ 標記完成初始化
    };
  
    fetchData();
  }, []);

  //計算專案進度
  const calculateProjectProgress = async (projectId) => {
    try {
      //查詢專案內所有任務
      const { data: tasks, error: taskError } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", projectId);

      if (taskError) throw taskError;
      if (!tasks || tasks.length === 0) {
        setProgress(0);
        return;
      }

      //查詢所有任務的 `task_checklists`
      const taskIds = tasks.map((task) => task.id);
      const { data: checklists, error: checklistError } = await supabase
        .from("task_checklists")
        .select("is_done")
        .in("task_id", taskIds);

      if (checklistError) throw checklistError;

      //計算完成的 checklist 數量
      const totalChecklistCount = checklists.length;
      const completedChecklistCount = checklists.filter((item) => item.is_done).length;

      //計算進度百分比
      const computedProgress = totalChecklistCount > 0
        ? Math.round((completedChecklistCount / totalChecklistCount) * 100)
        : 0;

        console.log(`📊 計算進度: ${computedProgress}% (完成: ${completedChecklistCount}/${totalChecklistCount})`);

      setProgress(computedProgress);
    } catch (err) {
      console.error("❌ 計算專案進度失敗", err);
      setProgress(0);
    }
  };

  // **開啟編輯模式**
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // **確認變更名稱**
  const handleConfirmUpdate = async () => {
    if (!project) return;

    const isConfirmed = window.confirm(`確定要將專案名稱改為「${newProjectName}」嗎？`);
    if (!isConfirmed) {
      setNewProjectName(project.name); // 取消時恢復舊名稱
      setIsEditing(false);
      return;
    }

    const { error } = await supabase
      .from("projects")
      .update({ name: newProjectName })
      .eq("id", project.id);

    if (error) {
      console.error("❌ 更新專案名稱失敗:", error);
      alert("❌ 更新失敗，請稍後再試！");
    } else {
      setProject((prev) => ({ ...prev, name: newProjectName }));
      localStorage.setItem("project_name", newProjectName);
    }

    setIsEditing(false);
  };

  // 點擊「任務清單」時傳遞 project_id
  const handleTaskListClick = () => {
    if (!project?.id) return;
    navigate(`/tasklist/${project.id}`);
  };

  return (
    <>
      <div style={{display: "flex", alignItems: "end", justifyContent: "space-between"}}>
        <div className={styles.home_pj_name_box}>
          {isEditing ? (
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              autoFocus
              style={{
                height: "23px",
                width: "150px",
                paddingLeft: "4px",
                fontSize: "16px",
                border: "1px solid #93B1C3",
                borderRadius: "6px",
                outline: "none",
                marginRight: "8px",
              }}
            />
          ) : (
            <p className={styles.home_project_name}>
              {project ? project.name : "未綁定專案"}
            </p>
          )}

          {isEditing ? (
            <CheckOutlined
              className={styles.home_check_icon}
              onClick={handleConfirmUpdate}
            />
          ) : (
            <EditOutlined
              className={styles.home_edit_icon}
              onClick={handleEditClick}
            />
          )}
        </div>
        <div>
          {user ? (
            <div>
              <p style={{margin: "0", fontSize: "12px"}}>👤使用者：{user.name}</p>
            </div>
          ) : (
            <p style={{margin: "0", fontSize: "12px"}}>載入中...</p>
          )}
        </div>
      </div>
      
      <div className={styles.home_encouragement_wall}>
        <img src={imgwall} className={styles.home_wall} alt="wall" />
        <div className={styles.home_wall_mask} style={{ height: maskHeight }} />
        <p className={styles.home_wall_text}>專案進度：{displayedProgress}%</p>
      </div>

      <div className={styles.home_option}>
        <div className={styles.home_op1} onClick={handleTaskListClick}>
          <img src={imgtasklist} className={styles.home_op_img} alt="tasklist" />
          <p className={styles.home_op_text}>任務清單</p>
        </div>
        <Link to={'/progress'}>
          <div className={styles.home_op2}>
            <img src={imgprogressRate} className={styles.home_op_img} alt="progressRate" />
            <p className={styles.home_op_text}>進度追蹤</p>
          </div>
        </Link>
        <Link to={'/cloud'}>
          <div className={styles.home_op2}>
            <img src={imgcloud} className={styles.home_op_img} alt="cloud" />
            <p className={styles.home_op_text}>資料共享</p>
          </div>
        </Link>
        <Link to={'/suggestion'}>
          <div className={styles.home_op1}>
            <img src={imgsuggestion} className={styles.home_op_img} alt="suggestion" />
            <p className={styles.home_op_text}>建議箱</p>
          </div>
        </Link>
        <Link to={'/memberprofile'}>
          <div className={styles.home_op1}>
            <img src={imgnotification} className={styles.home_op_img} alt="memberprofile" />
            <p className={styles.home_op_text}>專案成員資料</p>
          </div>
        </Link>
        <Link to={'/personal'}>
          <div className={styles.home_op2}>
            <img src={imgpersonal} className={styles.home_op_img} alt="personal" />
            <p className={styles.home_op_text}>個人專案管理</p>
          </div>
        </Link>
        </div>
        <Link to={'/notification'}>
          <div  className={styles.home_att}>
            <p>Image Attribution</p>
          </div>
        </Link>
    </>
  );
}

export default Home;
