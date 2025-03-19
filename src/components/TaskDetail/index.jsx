import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { EditOutlined, CheckOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import styles from "./taskdetail.module.css";

const TaskDetail = ({ taskId, onClose }) => {
  const [task, setTask] = useState(null);
  const [assignee, setAssignee] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [members, setMembers] = useState([]); // 專案成員
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState(""); // 暫存編輯值
  const [editingChecklist, setEditingChecklist] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState(""); // 新增待辦事項

  console.log("📌 `TaskDetail` 接收到的 `taskId`:", taskId);

  useEffect(() => {
    if (!taskId) {
      console.error("❌ `taskId` 為 undefined，無法查詢任務！");
      return;
    }

    const fetchTaskDetail = async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .maybeSingle();

        if (error) throw error;
        if (!data) {
          console.warn("⚠️ 找不到對應的任務");
          return;
        }
        setTask(data);

        const { data: user, error: userError } = await supabase
          .from("users")
          .select("name, picture")
          .eq("line_id", data.assignee_id)
          .maybeSingle();

        if (userError) console.error("❌ 無法讀取負責人", userError);
        else setAssignee(user);

        const { data: checklistData, error: checklistError } = await supabase
          .from("task_checklists")
          .select("id, content, is_done")
          .eq("task_id", taskId);

        if (checklistError) throw checklistError;
        setChecklist(checklistData);

        const { data: memberData, error: memberError } = await supabase
          .from("project_members")
          .select("user_id, real_name")
          .eq("project_id", data.project_id);

        if (memberError) throw memberError;
        setMembers(memberData);
      } catch (err) {
        console.error("❌ 任務讀取失敗", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [taskId]);

  // ✅ **進入編輯模式**
  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  // ✅ **更新任務欄位**
  const updateTaskField = async () => {
    try {
      await supabase
        .from("tasks")
        .update({ [editingField]: tempValue })
        .eq("id", taskId);

      setTask((prev) => ({ ...prev, [editingField]: tempValue }));
      setEditingField(null);
    } catch (err) {
      console.error(`❌ 更新 ${editingField} 失敗`, err);
    }
  };

  // ✅ **勾選/取消勾選待辦清單**
  const toggleChecklistItem = async (itemId, newStatus) => {
    try {
      await supabase
        .from("task_checklists")
        .update({ is_done: newStatus })
        .eq("id", itemId);

      setChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, is_done: newStatus } : item
        )
      );
    } catch (err) {
      console.error("❌ 更新 checklist 失敗", err);
    }
  };

  // ✅ **更新待辦清單內容**
  const updateChecklistContent = async (itemId) => {
    try {
      await supabase
        .from("task_checklists")
        .update({ content: tempValue })
        .eq("id", itemId);

      setChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, content: tempValue } : item
        )
      );
      setEditingChecklist(null);
    } catch (err) {
      console.error("❌ 更新 checklist 內容失敗", err);
    }
  };

  // ✅ **新增待辦清單**
  const addChecklistItem = async () => {
    if (!newChecklistItem) return;
    try {
      const { data, error } = await supabase
        .from("task_checklists")
        .insert([{ task_id: taskId, content: newChecklistItem, is_done: false }])
        .select("*")
        .single();

      if (error) throw error;
      setChecklist((prev) => [...prev, data]);
      setNewChecklistItem("");
    } catch (err) {
      console.error("❌ 新增 checklist 失敗", err);
    }
  };

  // ✅ **刪除待辦項目**
  const deleteChecklistItem = async (itemId) => {
    try {
      await supabase.from("task_checklists").delete().eq("id", itemId);
      setChecklist((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("❌ 刪除 checklist 失敗", err);
    }
  };

  // ✅ **刪除任務**
  const handleDelete = async () => {
    const isConfirmed = window.confirm("確定要刪除這個任務嗎？");
    if (!isConfirmed) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) {
      console.error("❌ 刪除失敗", error);
      alert("刪除失敗，請稍後再試！");
    } else {
      alert("✅ 任務已刪除");
      onClose(); // 回到任務列表
    }
  };

  // ✅ **完成任務**
  const handleComplete = async () => {
    if (checklist.length === 0) {
      alert("⚠️ 此任務沒有待辦清單項目！");
      return;
    }
  
    const isConfirmed = window.confirm("確定要標記所有待辦事項為完成嗎？");
    if (!isConfirmed) return;
  
    try {
      // 更新所有 checklist 為 `is_done: true`
      await Promise.all(
        checklist.map((item) =>
          supabase.from("task_checklists").update({ is_done: true }).eq("id", item.id)
        )
      );
  
      // 更新 UI
      setChecklist((prev) => prev.map((item) => ({ ...item, is_done: true })));
  
      alert("✅ 所有待辦事項已完成！");
      onClose(); // 回到清單列表
    } catch (err) {
      console.error("❌ 更新 checklist 失敗", err);
      alert("更新失敗，請稍後再試！");
    }
  };

  if (loading) return <p className={styles.loading}>載入中...</p>;
  if (!task) return <p className={styles.error}>❌ 找不到任務</p>;

  return (
    <div className={styles.taskdetail_container}>
      {/* ✅ 任務名稱 */}
      <p className={styles.taskdetail_content}>
      <strong>任務名稱：</strong>
        {editingField === "title" ? (
          <>
            <input 
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              style={{
                height: "19px",
                width: "150px",
                paddingLeft: "4px",
                fontSize: "14px",
                border: "1px solid #93B1C3",
                borderRadius: "6px",
                outline: "none",
              }}
            />
            <CheckOutlined 
              className={styles.taskdetail_checkicon}
              onClick={updateTaskField}
            />
          </>
        ) : (
          <>
            {task.title}
            <EditOutlined
              className={styles.taskdetail_editicon}
              onClick={() => startEditing("title", task.title)}
            />
          </>
        )}
      </p>

      {/* ✅ 負責人員 */}
      <div className={styles.taskdetail_content}>
        <strong>負責人員：</strong>
        {editingField === "assignee_id" ? (
          <>
            <select
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              style={{
                height: "23px",
                paddingLeft: "4px",
                paddingRight: "4px",
                fontSize: "14px",
                border: "1px solid #93B1C3",
                borderRadius: "6px",
                outline: "none",
              }}
            >
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {member.real_name}
                </option>
              ))}
            </select>
            <CheckOutlined
              className={styles.taskdetail_checkicon}
              onClick={updateTaskField}
            />
          </>
        ) : (
          <>
            {assignee?.name || "載入中..."}{" "}
            <EditOutlined
              onClick={() => startEditing("assignee_id", task.assignee_id)}
              className={styles.taskdetail_editicon}
            />
          </>
        )}
      </div>

      {/* ✅ 截止日期 */}
      <div className={styles.taskdetail_content}>
        <strong>截止日期：</strong>{" "}
        {editingField === "due_date" ? (
          <>
            <input 
              type="date"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              style={{
                height: "23px",
                paddingLeft: "4px",
                paddingRight: "4px",
                fontSize: "14px",
                border: "1px solid #93B1C3",
                borderRadius: "6px",
                outline: "none",
              }}
            />
            <CheckOutlined 
              onClick={updateTaskField}
              className={styles.taskdetail_checkicon}
            />
          </>
        ) : (
          <>
            {task.due_date || "未設定"}{" "}
            <EditOutlined
              onClick={() => startEditing("due_date", task.due_date)}
              className={styles.taskdetail_editicon}
            />
          </>
        )}
      </div>

      {/* ✅ 任務內容 */}
      <div className={styles.taskdetail_content2}>
        <strong>任務內容：</strong>{" "}
        {editingField === "description" ? (
          <div style={{display: "flex", flexDirection: "row"}}>
            <textarea
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              style={{
                paddingLeft: "4px",
                paddingRight: "4px",
                marginTop: "5px",
                width: "100%",
                fontSize: "14px",
                border: "1px solid #93B1C3",
                borderRadius: "6px",
                outline: "none",
                resize: "vertical"
              }}
            />
            <CheckOutlined
              onClick={updateTaskField}
              className={styles.taskdetail_checkicon}
            />
          </div>
        ) : (
          <div style={{display: "flex", flexDirection: "row"}}>
            {task.description}{" "}
            <EditOutlined
              onClick={() => startEditing("description", task.description)}
              className={styles.taskdetail_editicon}
            />
          </div>
        )}
      </div>

      <div style={{width: "100%", height: "1px", backgroundColor: "#89A8B2"}}></div>
      {/* ✅ 待辦清單 */}
      <p className={styles.taskdetail_list}>待辦清單：</p>
      <ul className={styles.taskdetail_checklist}>
        {checklist.map((item) => (
          <li key={item.id}>
            <input
              type="checkbox"
              checked={item.is_done}
              onChange={() => toggleChecklistItem(item.id, !item.is_done)}
            />
            {editingChecklist === item.id ? (
              <>
                <input
                  type="text"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  style={{
                    height: "19px",
                    width: "150px",
                    paddingLeft: "4px",
                    fontSize: "14px",
                    border: "1px solid #93B1C3",
                    borderRadius: "6px",
                    outline: "none",
                  }}
                />
                <CheckOutlined
                  onClick={() => updateChecklistContent(item.id)}
                  className={styles.taskdetail_checkicon}
                />
              </>
            ) : (
              <>
                {item.content}
                <EditOutlined
                  onClick={() => setEditingChecklist(item.id) || setTempValue(item.content)}
                  className={styles.taskdetail_editicon}
                />
                <DeleteOutlined
                  onClick={() => deleteChecklistItem(item.id)}
                  style={{position: "absolute", right: "20px", marginTop: "9px"}}
                />
              </>
            )}
            <div style={{width: "100%", height: "1px", backgroundColor: "#89A8B2", marginBottom: "5px"}}></div>
          </li>
        ))}
      </ul>
      <div style={{display: "flex", flexDirection: "row", marginBottom: "30px"}}>
        <input
          type="text"
          placeholder="新增待辦事項"
          value={newChecklistItem}
          onChange={(e) => setNewChecklistItem(e.target.value)}
          className={styles.taskdetail_newinput}
        />
        <PlusOutlined onClick={addChecklistItem} style={{marginRight: "9px"}}/>
      </div>

      {/* ✅ 按鈕區域 */}
      <div className={styles.taskdetail_btnContainer}>
        <button className={styles.taskdetail_closeButton} onClick={onClose}>返回</button>
        <button className={styles.taskdetail_deleteButton} onClick={handleDelete}>刪除</button>
        <button className={styles.taskdetail_completeButton} onClick={handleComplete}>完成</button>
      </div>
    </div>
  );
};

export default TaskDetail;

