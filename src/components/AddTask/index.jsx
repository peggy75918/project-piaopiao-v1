import { useState } from "react"
import styles from "./addtask.module.css"

const AddTask = () => {
  // 狀態管理輸入值
  const [taskName, setTaskName] = useState("");
  const [responsible, setResponsible] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskContent, setTaskContent] = useState("");
  const [progress, setProgress] = useState([
    { id: 1, text: "找參考資料", completed: false },
  ]);
  const [newProgress, setNewProgress] = useState(""); // 新增的進度

  // 切換 checkbox 狀態
  const toggleCheckbox = (id) => {
    setProgress(progress.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  // 新增進度項目
  const addProgressItem = () => {
    if (newProgress.trim() !== "") {
      setProgress([...progress, { id: progress.length + 1, text: newProgress, completed: false }]);
      setNewProgress("");
    }
  };

  // 刪除進度項目
  const deleteProgressItem = (id) => {
    setProgress(progress.filter(item => item.id !== id));
  };

  return (
    <div className={styles.addtask_container}>
      {/* 任務名稱 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>任務名稱：</label>
        <input
            type="text"
            placeholder="請輸入任務名稱，如 Wireframe"
            value={taskName}
            onChange={(e) => setTaskName(e.target.value)}
            className={styles.addtask_input}
        />
      </div>

      {/* 負責人 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>負責人員：</label>
        <select value={responsible} onChange={(e) => setResponsible(e.target.value)} className={styles.addtask_input}>
          <option value="" disabled>請選擇負責人</option>
          <option value="林三折">林三折</option>
          <option value="木十一">木十一</option>
          <option value="吐司貓">吐司貓</option>
        </select>
      </div>

      {/* 截止日期 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>截止日期：</label>
        <input
            type="date"
            placeholder="請選擇截止日期"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={styles.addtask_input}
        />
      </div>

      {/* 任務內容 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>任務內容：</label>
        <textarea
            placeholder="請輸入任務內容，如：完成網頁首頁、購物頁面線框稿"
            value={taskContent}
            onChange={(e) => setTaskContent(e.target.value)}
            className={styles.addtask_textarea}
        />
      </div>

      {/* 進度安排 */}
      <div className={styles.addtask_inputGroup}>
        <label className={styles.addtask_label}>進度安排：</label>
        <div>
          {progress.map(item => (
            <div  key={item.id} className={styles.addtask_checkbox}>
                <div className={styles.addtask_checkboxContainer}>
                    <div className={styles.addtask_checkboxContent}>
                        <input type="checkbox" checked={item.completed} onChange={() => toggleCheckbox(item.id)} />
                        <span className={item.completed ? styles.addtask_completedText : styles.addtask_uncompletedText}>{item.text}</span>
                    </div>
                    <button onClick={() => deleteProgressItem(item.id)} className={styles.addtask_deleteButton}>x</button>
                </div>
                <div className={styles.addtask_line}></div>
            </div>   
          ))}
          <div className={styles.addtask_newProgressInput}>
            <input
              type="text"
              placeholder="請輸入待辦進度"
              value={newProgress}
              onChange={(e) => setNewProgress(e.target.value)}
              className={styles.addtask_newinput}
            />
            <button onClick={addProgressItem} className={styles.addtask_addButton}>+</button>
          </div>
        </div>
      </div>

      {/* 按鈕 */}
      <div className={styles.addtask_buttonContainer}>
        <button className={styles.addtask_cancelButton}>取消</button>
        <button className={styles.addtask_saveButton}>新增</button>
      </div>
    </div>
  );
};

export default AddTask;
