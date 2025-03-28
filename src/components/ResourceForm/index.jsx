import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { v4 as uuidv4 } from "uuid";
import styles from "./resourceform.module.css";

const ResourceForm = ({ projectId, currentUserId, onSubmitSuccess }) => {
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !link) {
      alert("請填寫完整資訊");
      return;
    }


    const newId = uuidv4(); // ✅ 產生一個唯一 ID
    console.log("📌 產生的新資源 ID:", newId);
    console.log("📌 將送出的 user_id:", currentUserId);
    console.log("📌 將送出的 project_id:", projectId);

    const { error } = await supabase.from("shared_resources").insert({
      id: newId,
      project_id: projectId,
      user_id: currentUserId,
      title,
      description,
      link,
      tag,
    });

    if (error) {
      console.error("❌ 發布失敗：", error);
      alert("發布失敗：" + error.message);
    } else {
      alert("✅ 資源已發布！");
      setTitle("");
      setDescription("");
      setLink("");
      onSubmitSuccess(); // ✅ 呼叫傳入的刷新函式
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.resourceform_form}>
      <input
        type="text"
        className={styles.resourceform_input}
        placeholder="資源標題"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        className={styles.resourceform_input}
        placeholder="資源標籤（如：程式、UI/UX、AI）"
        value={tag}
        onChange={(e) => setTag(e.target.value)}
      />
      <input
        type="url"
        className={styles.resourceform_input}
        placeholder="相關連結（包含 https://）"
        value={link}
        onChange={(e) => setLink(e.target.value)}
      />
      <textarea
        className={styles.resourceform_input}
        placeholder="補充描述（可選）"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" className={styles.resourceform_button}>
        發布資源
      </button>
    </form>
  );
};

export default ResourceForm;


