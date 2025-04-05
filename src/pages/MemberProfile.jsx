import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import Topbar from "../components/Topbar";
import styles from "./memberprofile.module.css";

const defaultTags = ["程式設計", "視覺設計"];

const MemberProfile = () => {
  const projectId = localStorage.getItem("project_id");
  const currentUserId = localStorage.getItem("line_id");

  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [myTags, setMyTags] = useState([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    const { data, error } = await supabase
      .from("project_members")
      .select("user_id, real_name, attribute_tags")
      .eq("project_id", projectId);

    if (error) {
      console.error("❌ 成員讀取失敗", error);
      return [];
    }
    setMembers(data || []);
    const me = data.find((m) => m.user_id === currentUserId);
    if (me?.attribute_tags) setMyTags(me.attribute_tags);
    return data;
  };

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("tasks")
      .select("id, assignee_id, project_id, task_checklists(*)")
      .eq("project_id", projectId);

    if (error) {
      console.error("❌ 任務讀取失敗", error);
      return [];
    }
    setTasks(data || []);
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await fetchMembers();
      await fetchTasks();
      setLoading(false);
    };
    if (projectId && currentUserId) fetchData();
  }, [projectId, currentUserId]);

  const handleToggleTag = (tag) => {
    setMyTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const newTag = prompt("請輸入自訂屬性 (最多 5 個屬性)");
    if (!newTag) return;
    if (myTags.length >= 5) return alert("最多只能選擇 5 個屬性");
    if (!myTags.includes(newTag)) setMyTags([...myTags, newTag]);
  };

  const handleSave = async () => {
    if (!myTags.includes("程式設計") && !myTags.includes("視覺設計")) {
      alert("請至少選擇「程式」或「視覺」其中之一");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("project_members")
      .update({ attribute_tags: myTags })
      .eq("project_id", projectId)
      .eq("user_id", currentUserId);

    if (error) {
      console.error("❌ 更新屬性失敗", error);
      alert("更新失敗，請稍後再試");
    } else {
      alert("✅ 成功儲存屬性");
      setEditing(false);
      await fetchMembers();
    }
    setSaving(false);
  };

  const getStatsForUser = (userId) => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const userTasks = tasks.filter((t) => t.assignee_id === userId);
    const total = userTasks.length;
    let completed = 0;
    let completedThisWeek = 0;

    userTasks.forEach((task) => {
      const allDone = task.task_checklists.every((c) => c.is_done);
      if (allDone && task.task_checklists.length > 0) {
        completed++;
        const latest = task.task_checklists
          .filter((c) => c.completed_at)
          .map((c) => new Date(c.completed_at))
          .sort((a, b) => b - a)[0];

        if (latest && latest >= startOfWeek) {
          completedThisWeek++;
        }
      }
    });

    return { total, completed, completedThisWeek };
  };

  if (loading) return <p style={{ textAlign: "center" }}>載入中...</p>;

  return (
    <div className={styles.member_container}>
      <Topbar />
      <div className={styles.card_list}>
        {members.map((m) => {
          const stats = getStatsForUser(m.user_id);
          return (
            <div key={m.user_id} className={styles.member_card}>
              <p className={styles.member_name}>{m.real_name}</p>

              <div className={styles.tag_area}>
                {m.user_id === currentUserId && editing ? (
                  <>
                    {[...defaultTags, ...myTags.filter(t => !defaultTags.includes(t))].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={myTags.includes(tag) ? styles.tag_selected : styles.tag_unselected}
                      >
                        {tag}
                      </button>
                    ))}
                    {myTags.length < 5 && (
                      <button className={styles.custom_tag_btn} onClick={handleAddCustomTag}>
                        ➕ 自訂
                      </button>
                    )}
                  </>
                ) : (
                  <div className={styles.member_tags}>
                    {(m.attribute_tags || []).length > 0 ? (
                      m.attribute_tags.map((tag, index) => (
                        <span key={index} className={styles.readonly_tag}>#{tag}</span>
                      ))
                    ) : (
                      <span className={styles.placeholder_tag}>尚未設定成員屬性</span>
                    )}
                  </div>
                )}
              </div>

              <div className={styles.task_info}>
                <span>專案完成任務：{stats.completed}/{stats.total}</span>
                <span>｜本週完成任務數：{stats.completedThisWeek}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.button_row}>
        {editing ? (
          <>
            <button onClick={handleSave} disabled={saving}>儲存</button>
            <button onClick={() => setEditing(false)}>取消</button>
          </>
        ) : (
          <button onClick={() => setEditing(true)}>編輯我的屬性</button>
        )}
      </div>
    </div>
  );
};

export default MemberProfile;


