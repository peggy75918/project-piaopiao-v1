import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase"; // Supabase 連線
import { v4 as uuidv4 } from "uuid"; // 產生 UUID
import styles from "./addtask.module.css";

const AddTask = ({ onCancel, projectId, stage }) => { // 接收 `projectId` 和 `stage`
  const [taskName, setTaskName] = useState("");
  const [responsible, setResponsible] = useState("");
  const [members, setMembers] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [taskContent, setTaskContent] = useState("");
  const [progress, setProgress] = useState([
    { id: uuidv4(), text: "找參考資料", completed: false },
  ]);
  const [newProgress, setNewProgress] = useState("");

  useEffect(() => {
    const fetchProjectMembers = async () => {
      if (!projectId) return;
  
      console.log("📢 查詢專案成員...");
      const { data, error } = await supabase
        .from("project_members")
        .select("user_id, real_name")
        .eq("project_id", projectId);
  
      if (error) {
        console.error("❌ 讀取專案成員失敗", error);
      } else {
        console.log("✅ 讀取到的成員:", data);
        setMembers(data);
      }
    };
  
    fetchProjectMembers();
  }, [projectId]);

  // **切換 checkbox 狀態**
  const toggleCheckbox = (id) => {
    setProgress(progress.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // **新增待辦清單項目**
  const addProgressItem = () => {
    if (newProgress.trim() !== "") {
      setProgress([...progress, { id: uuidv4(), text: newProgress, completed: false }]);
      setNewProgress("");
    }
  };

  // **刪除待辦清單項目**
  const deleteProgressItem = (id) => {
    setProgress(progress.filter(item => item.id !== id));
  };

  // **提交任務**
  const handleSubmit = async () => {
    if (!taskName || !responsible || !dueDate || !taskContent) {
      alert("⚠️ 請填寫所有欄位！");
      return;
    }

    const taskId = uuidv4(); // 產生唯一任務 ID

    // **1️⃣ 插入 `tasks` 資料表**
    const { error: taskError } = await supabase.from("tasks").insert([
      {
        id: taskId,
        project_id: projectId,
        status: stage, // 當前階段
        title: taskName,
        assignee_id: responsible,
        due_date: dueDate,
        description: taskContent,
      },
    ]);

    if (taskError) {
      console.error("❌ 任務新增失敗", taskError);
      alert("❌ 任務新增失敗，請稍後再試！");
      return;
    }

    // **2️⃣ 插入 `task_checklists`（如果有待辦清單）**
    if (progress.length > 0) {
      const checklistData = progress.map((item) => ({
        task_id: taskId,
        content: item.text,
        is_done: item.completed,
      }));

      const { error: checklistError } = await supabase.from("task_checklists").insert(checklistData);

      if (checklistError) {
        console.error("❌ 代辦清單新增失敗", checklistError);
        alert("❌ 部分任務可能未正確儲存！");
      }
    }

    alert("✅ 任務新增成功！");
    onCancel(); // 返回 Tasklist
  };

  return (
    <div className={styles.addtask_container}>
      {/* 任務名稱 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>任務名稱：</label>
        <input
          type="text"
          placeholder="請輸入任務名稱"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className={styles.addtask_input}
        />
      </div>

      {/* 負責人 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>負責人員：</label>
        <select 
          value={responsible} 
          onChange={(e) => setResponsible(e.target.value)} 
          className={styles.addtask_input}
        >
          <option value="" disabled>請選擇負責人</option>
          {members.map((member) => (
            <option key={member.user_id} value={member.user_id}>
              {member.real_name}
            </option>
          ))}
        </select>
      </div>

      {/* 截止日期 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>截止日期：</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className={styles.addtask_input}
        />
      </div>

      {/* 任務內容 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>任務內容：</label>
        <textarea
          placeholder="請輸入任務內容"
          value={taskContent}
          onChange={(e) => setTaskContent(e.target.value)}
          className={styles.addtask_textarea}
        />
      </div>

      {/* 進度安排 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>待辦清單（至少一項）：</label>
        {progress.map(item => (
          <div key={item.id} className={styles.addtask_checkbox}>
            <div className={styles.addtask_checkboxContainer}>
              <div className={styles.addtask_checkboxContent}>
                <input type="checkbox" checked={item.completed} onChange={() => toggleCheckbox(item.id)} />
                <span className={item.completed ? styles.addtask_completedText : styles.addtask_uncompletedText}>{item.text}</span>
              </div>
              <button onClick={() => deleteProgressItem(item.id)} className={styles.addtask_deleteButton}>x</button>
            </div>
          </div>
        ))}
        <div className={styles.addtask_newProgressInput}>
          <input
            type="text"
            placeholder="輸入待辦事項"
            value={newProgress}
            onChange={(e) => setNewProgress(e.target.value)}
            className={styles.addtask_newinput}
          />
          <button onClick={addProgressItem} className={styles.addtask_addButton}>+</button>
        </div>
      </div>

      {/* 按鈕 */}
      <div className={styles.addtask_buttonContainer}>
        <button className={styles.addtask_cancelButton} onClick={onCancel}>取消</button>
        <button className={styles.addtask_saveButton} onClick={handleSubmit}>新增</button>
      </div>
    </div>
  );
};

export default AddTask;

