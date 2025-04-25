import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./suggestioncard.module.css";

const SuggestionCard = ({ task, currentUser }) => {
  const [assignee, setAssignee] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(3);
  const [myCommentId, setMyCommentId] = useState(null);
  const [reflection, setReflection] = useState("");
  const [showInputs, setShowInputs] = useState(false);
  const [editingReflection, setEditingReflection] = useState(false);
  const [checklist, setChecklist] = useState([]);
  const [showChecklist, setShowChecklist] = useState(false);

  useEffect(() => {
    fetchAssignee();
    fetchFeedbacks();
  }, [task.id]);

  const fetchAssignee = async () => {
    const { data } = await supabase
      .from("users")
      .select("name, picture")
      .eq("line_id", task.assignee_id)
      .maybeSingle();
    setAssignee(data);
  };

  const fetchChecklist = async () => {
    const { data } = await supabase
      .from("task_checklists")
      .select("content, is_done")
      .eq("task_id", task.id)
      .order("id", { ascending: true });
    setChecklist(data || []);
  };

  const toggleChecklist = () => {
    if (!showChecklist) fetchChecklist();
    setShowChecklist(!showChecklist);
  };

  const fetchFeedbacks = async () => {
    const { data } = await supabase
      .from("task_feedbacks")
      .select("*")
      .eq("task_id", task.id)
      .order("created_at", { ascending: true });

    const userIds = [...new Set(data.map((f) => f.user_id))];
    const { data: users } = await supabase
      .from("users")
      .select("line_id, name")
      .in("line_id", userIds);

    const map = {};
    users.forEach((u) => {
      map[u.line_id] = u.name;
    });

    setUserMap(map);
    setFeedbacks(data);

    const myFeedback = data.find((f) => f.user_id === currentUser && !f.is_reflection);
    if (myFeedback) {
      setNewComment(myFeedback.content);
      setRating(myFeedback.rating);
      setMyCommentId(myFeedback.id);
    } else {
      setNewComment("");
      setRating(3);
      setMyCommentId(null);
    }

    const reflectionData = data.find((f) => f.is_reflection && f.user_id === task.assignee_id);
    if (reflectionData) setReflection(reflectionData.content);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) {
      alert("⚠️ 留言內容不能為空");
      return;
    }

    if (myCommentId) {
      await supabase
        .from("task_feedbacks")
        .update({ content: newComment, rating, is_reflection: false })
        .eq("id", myCommentId);
    } else {
      await supabase.from("task_feedbacks").insert({
        task_id: task.id,
        user_id: currentUser,
        content: newComment,
        rating,
        is_reflection: false,
      });
    }

    alert("✅ 留言已成功送出");
    setShowInputs(false);
    fetchFeedbacks();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("確定要刪除這則留言嗎？")) return;
    await supabase.from("task_feedbacks").delete().eq("id", id);
    fetchFeedbacks();
  };

  const handleSaveReflection = async () => {
    if (!reflection.trim()) {
      alert("⚠️ 反思內容不能為空");
      return;
    }

    const existing = feedbacks.find((f) => f.is_reflection && f.user_id === currentUser);
    if (existing) {
      await supabase
        .from("task_feedbacks")
        .update({ content: reflection })
        .eq("id", existing.id);
    } else {
      await supabase.from("task_feedbacks").insert({
        task_id: task.id,
        user_id: currentUser,
        content: reflection,
        is_reflection: true
      });
    }
    alert("✅ 反思已成功送出");
    setEditingReflection(false);
    fetchFeedbacks();
  };

  const ratedFeedbacks = feedbacks.filter(f => !f.is_reflection && typeof f.rating === "number");
  const avgRating =
    ratedFeedbacks.length > 0
      ? Math.round(ratedFeedbacks.reduce((sum, f) => sum + f.rating, 0) / ratedFeedbacks.length)
      : null;

  return (
    <div className={styles.suggestion_card}>
      <div className={styles.suggestion_header}>
        <div className={styles.suggestion_title}>{task.title}</div>
        <div style={{width: '100%', height: '1px', backgroundColor: '#153448'}}></div>
        <div className={styles.suggestion_meta}>負責人：{assignee?.name || "載入中..."}</div>
        <div className={styles.suggestion_description}>任務內容：{task.description}</div>
        <button onClick={toggleChecklist} className={styles.suggestion_checklist_btn}>
          {showChecklist ? "🔽 收合清單" : "▶️ 查看待辦清單"}
        </button>
        {showChecklist && (
          <ul className={styles.suggestion_checklist}>
            {checklist.map((item, index) => (
              <li key={index}>
                <span style={{ color: item.is_done ? "green" : "gray" }}>
                  {item.is_done ? "" : "⬜"}
                </span>{" "}
                {item.content}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.suggestion_label}>任務留言：</div>
      <div className={styles.suggestion_comment_list}>
        {feedbacks
          .filter((f) => !f.is_reflection)
          .map((f) => (
            <div key={f.id} className={styles.suggestion_comment}>
              <span className={styles.suggestion_user}>{userMap[f.user_id] || f.user_id}：</span>
              <div className={styles.suggestion_comment_content}>{f.content}</div>
              <div style={{flexShrink: '0'}}>{f.rating && <>⭐ {f.rating}</>}</div>
              {f.user_id === currentUser && (
                <button onClick={() => handleDelete(f.id)} className={styles.suggestion_delete_btn}>
                  刪除
                </button>
              )}
            </div>
          ))}
          {avgRating !== null && (
            <p className={styles.suggestion_avg}>
              ⭐ {avgRating > 0 ? `平均評分：${avgRating}` : "尚未評分"}
            </p>
          )}

      </div>

        {!showInputs ? (
          <button onClick={() => setShowInputs(true)} className={styles.suggestion_comment_inputbtn}>撰寫留言與評分</button>
        ) : (
          <div className={styles.suggestion_my_comment}>
            <input
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="輸入你的建議..."
              className={styles.suggestion_input}
            />
            <div className={styles.suggestion_slider}>
              評分：
              <input
                type="range"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
              /> ⭐{rating}
            </div>
            <button onClick={handleSubmit} className={styles.suggestion_submitbtn}>送出</button>
          </div>
        )}

      <div className={styles.suggestion_reflection_section}>
        <div className={styles.suggestion_label}>任務反思：</div>
        {currentUser === task.assignee_id ? (
          editingReflection ? (
            <>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
              />
              <button onClick={handleSaveReflection} className={styles.suggestion_submitbtn}>儲存反思</button>
            </>
          ) : (
            <>
              <p className={styles.suggestion_reflection_text}>{reflection || "尚未撰寫反思"}</p>
              <button onClick={() => setEditingReflection(true)} className={styles.suggestion_reflection_btn}>編輯反思</button>
            </>
          )
        ) : (
          <p>{reflection || "尚未撰寫反思"}</p>
        )}
      </div>
    </div>
  );
};

export default SuggestionCard;






