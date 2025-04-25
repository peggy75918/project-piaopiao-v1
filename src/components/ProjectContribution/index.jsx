import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./projectContribution.module.css";

const ProjectContribution = ({ projectId, currentUser }) => {
  const [expanded, setExpanded] = useState(false);
  const [contribution, setContribution] = useState(null);

  useEffect(() => {
    if (expanded) fetchContribution();
  }, [expanded]);

  const fetchContribution = async () => {
    try {
      // 1️⃣ 查詢角色
      const { data: member } = await supabase
        .from("project_members")
        .select("attribute_tags")
        .eq("project_id", projectId)
        .eq("user_id", currentUser)
        .maybeSingle();

      // 2️⃣ 查詢資源數量
      const { count: resourceCount } = await supabase
        .from("shared_resources")
        .select("*", { count: "exact", head: true })
        .eq("project_id", projectId)
        .eq("user_id", currentUser);

      // 3️⃣ 查詢留言建議次數
      const { data: tasks } = await supabase
        .from("tasks")
        .select("id")
        .eq("project_id", projectId);

      const taskIds = tasks.map(t => t.id);

      const { count: commentCount } = await supabase
        .from("task_feedbacks")
        .select("*", { count: "exact", head: true })
        .in("task_id", taskIds)
        .eq("user_id", currentUser)
        .eq("is_reflection", false);

        setContribution({
            role: Array.isArray(member?.attribute_tags) && member.attribute_tags.length > 0
              ? member.attribute_tags.join("、")
              : "未設定",
            resources: resourceCount || 0,
            comments: commentCount || 0,
        });
    } catch (err) {
      console.error("❌ 載入角色與貢獻失敗", err);
    }
  };

  return (
    <div className={styles.contribution_container}>
      <button onClick={() => setExpanded(!expanded)} className={styles.contribution_button}>
        {expanded ? "🔽 關閉角色與貢獻" : "▶️ 查看角色與貢獻"}
      </button>

      {expanded && contribution && (
        <div className={styles.contribution_panel}>
          <p>你的角色：{contribution.role}</p>
          <p>上傳的資源數：{contribution.resources}</p>
          <p>發表的留言建議：{contribution.comments}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectContribution;
