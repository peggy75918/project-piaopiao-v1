import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { CheckCircleFilled } from "@ant-design/icons";
import styles from "./taskcard.module.css";

const Taskcard = ({ task }) => {
  const [assignee, setAssignee] = useState(null);
  const [checklistProgress, setChecklistProgress] = useState({ completed: 0, total: 0 });
  const [daysLeft, setDaysLeft] = useState(null);
  const [timeClass, setTimeClass] = useState(styles.taskcard_timetext_default); // 預設時間框顏色
  const [bgClass, setBgClass] = useState(""); // 背景顏色類別

  useEffect(() => {
    if (!task) return;

    // **📌 1️⃣ 讀取負責人資訊**
    const fetchAssignee = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("name, picture")
        .eq("line_id", task.assignee_id)
        .maybeSingle();

      if (error) {
        console.error("❌ 無法讀取負責人資料", error);
      } else {
        setAssignee(data);
      }
    };

    // **📌 2️⃣ 讀取待辦清單進度**
    const fetchChecklistProgress = async () => {
      const { data, error } = await supabase
        .from("task_checklists")
        .select("is_done")
        .eq("task_id", task.id);

      if (error) {
        console.error("❌ 無法讀取待辦清單", error);
      } else {
        const completedCount = data.filter(item => item.is_done).length;
        setChecklistProgress({ completed: completedCount, total: data.length });

        // **先檢查是否所有任務都完成**
        if (data.length > 0 && completedCount === data.length) {
          setBgClass(styles.taskcard_bg_completed); // ✅ 完成背景
        } else {
          calculateDaysLeft();
        }
      }
    };

    // **📌 3️⃣ 計算截止日期並設定時間框 & 背景顏色**
    const calculateDaysLeft = () => {
      if (!task.due_date) return;
      const today = new Date();
      const dueDate = new Date(task.due_date);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        setTimeClass(styles.taskcard_timetext_overdue);
        setBgClass(styles.taskcard_bg_overdue);
        setDaysLeft("已逾期");
      } else if (diffDays === 0) {
        setTimeClass(styles.taskcard_timetext_due_today);
        setBgClass(styles.taskcard_bg_warning);
        setDaysLeft("今日到期");
      } else if (diffDays > 7) {
        setTimeClass(styles.taskcard_timetext_default);
        setBgClass(""); // 預設背景
        setDaysLeft(`${dueDate.getMonth() + 1}/${dueDate.getDate()} 到期`);
      } else {
        setTimeClass(styles.taskcard_timetext_warning);
        setBgClass(styles.taskcard_bg_warning);
        setDaysLeft(`倒數 ${diffDays} 天`);
      }
    };

    fetchAssignee();
    fetchChecklistProgress();
  }, [task]);

  return (
    <div className={`${styles.taskcard_container} ${bgClass}`} style={{display: "flex", flexDirection: "column"}}>
      <div style={{display: "flex"}}>
        <div>
          {assignee && <img src={assignee.picture} alt="負責人頭像" className={styles.taskcard_avatar} />}
        </div>
        <div className={styles.taskcard_content}>
          <p className={styles.taskcard_text}>{task.title}</p>
          <p className={styles.taskcard_text}>負責人：{assignee ? assignee.name : "載入中..."}</p>
          <p className={styles.taskcard_text}>
            任務進度：{checklistProgress.completed}/{checklistProgress.total}
          </p>
        </div>
      </div>
      
      <div className={styles.taskcard_time}>
        {checklistProgress.total > 0 && checklistProgress.completed === checklistProgress.total ? (
          <CheckCircleFilled className={styles.taskcard_completed_icon} />
        ) : (
          <p className={`${styles.taskcard_timetext} ${timeClass}`}>{daysLeft}</p>
        )}
      </div>
    </div>
  );
};

export default Taskcard;



