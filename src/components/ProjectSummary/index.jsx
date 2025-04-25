import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./projectSummary.module.css";

const ProjectSummary = ({ projectId, currentUser }) => {
    const [expanded, setExpanded] = useState(false);
    const [summary, setSummary] = useState(null);
  
    useEffect(() => {
      if (expanded && projectId) {
        fetchSummary();
      }
    }, [expanded, projectId]);
  
    const fetchSummary = async () => {
      try {
        const { data: allTasks } = await supabase
          .from("tasks")
          .select("id, assignee_id, due_date")
          .eq("project_id", projectId);
  
        const taskIds = allTasks.map((t) => t.id);
        const now = new Date();
        const upcomingThreshold = new Date();
        upcomingThreshold.setDate(now.getDate() + 3);
  
        const completedTasksRes = await supabase
          .from("task_checklists")
          .select("task_id, is_done")
          .in("task_id", taskIds);
  
        const completedMap = {};
        completedTasksRes.data.forEach((item) => {
          if (!completedMap[item.task_id]) completedMap[item.task_id] = [];
          completedMap[item.task_id].push(item);
        });
  
        let total = allTasks.length;
        let completed = 0;
        let userTotal = 0;
        let userCompleted = 0;
        let overdue = 0;
        let upcoming = 0;
  
        const userTaskIds = [];
  
        for (let task of allTasks) {
          const checklist = completedMap[task.id] || [];
          const isCompleted = checklist.length > 0 && checklist.every((i) => i.is_done);
          if (isCompleted) completed++;
  
          if (task.assignee_id === currentUser) {
            userTotal++;
            userTaskIds.push(task.id);
            if (isCompleted) userCompleted++;
          }
  
          if (task.due_date) {
            const due = new Date(task.due_date);
            if (!isCompleted && due < now) overdue++;
            else if (!isCompleted && due < upcomingThreshold) upcoming++;
          }
        }
  
        // ✅ 修正：查找使用者「負責的任務」收到的評分
        const { data: feedbacks } = await supabase
          .from("task_feedbacks")
          .select("rating")
          .in("task_id", userTaskIds)
          .is("is_reflection", false);
  
        const avgRating = feedbacks.length > 0
          ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
          : "--";
  
        setSummary({ total, completed, userTotal, userCompleted, avgRating, overdue, upcoming });
      } catch (err) {
        console.error("❌ 載入概況失敗", err);
      }
    };

    return (
        <div className={styles.summary_container}>
        <button className={styles.summary_button} onClick={() => setExpanded(!expanded)}>
            {expanded ? "🔽 關閉專案參與概況" : "▶️ 查看專案參與概況"}
        </button>

        {expanded && summary && (
            <div className={styles.summary_panel}>
            <p>專案總任務數：{summary.total}</p>
            <p>專案已完成任務數：{summary.completed}</p>
            <p>專案任務預警：{summary.overdue} 項逾期，{summary.upcoming} 項三日內到期</p>
            <p>負責任務已完成 / 總數：{summary.userCompleted} / {summary.userTotal}</p>
            <p>負責任務平均評分：⭐ {summary.avgRating}</p>
            </div>
        )}
        </div>
    );
};

export default ProjectSummary;
