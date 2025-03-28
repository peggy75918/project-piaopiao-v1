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

  useEffect(() => {
    if (!taskId) return;

    const fetchTaskDetail = async () => {
      try {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .eq("id", taskId)
          .maybeSingle();

        if (error || !data) return;
        setTask(data);

        const { data: user } = await supabase
          .from("users")
          .select("name, picture")
          .eq("line_id", data.assignee_id)
          .maybeSingle();

        if (user) setAssignee(user);

        const { data: checklistData } = await supabase
          .from("task_checklists")
          .select("id, content, is_done, updated_at, completed_at")
          .eq("task_id", taskId);

        setChecklist(checklistData);

        const { data: memberData } = await supabase
          .from("project_members")
          .select("user_id, real_name")
          .eq("project_id", data.project_id);

        setMembers(memberData);
      } catch (err) {
        console.error("❌ 任務讀取失敗", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetail();
  }, [taskId]);

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  // ✅ 更新任務欄位，若為 due_date 則轉為 UTC
  const updateTaskField = async () => {
    try {
      let value = tempValue;

      if (editingField === "due_date") {
        const localDate = new Date(tempValue);
        const utcDate = new Date(localDate.getTime() - 8 * 60 * 60 * 1000);
        value = utcDate.toISOString().split("T")[0];
      }

      await supabase.from("tasks").update({ [editingField]: value }).eq("id", taskId);
      setTask((prev) => ({ ...prev, [editingField]: value }));
      setEditingField(null);
    } catch (err) {
      console.error(`❌ 更新 ${editingField} 失敗`, err);
    }
  };

  // ✅ 勾選/取消勾選並記錄 completed_at
  const toggleChecklistItem = async (itemId, newStatus) => {
    try {
      const updateFields = {
        is_done: newStatus,
        completed_at: newStatus ? new Date().toISOString() : null,
      };

      await supabase.from("task_checklists").update(updateFields).eq("id", itemId);

      setChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, ...updateFields } : item
        )
      );
    } catch (err) {
      console.error("❌ 更新 checklist 失敗", err);
    }
  };

  // ✅ 更新 checklist 並記錄 updated_at
  const updateChecklistContent = async (itemId) => {
    try {
      const now = new Date().toISOString();
      await supabase
        .from("task_checklists")
        .update({ content: tempValue, updated_at: now })
        .eq("id", itemId);

      setChecklist((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, content: tempValue, updated_at: now } : item
        )
      );
      setEditingChecklist(null);
    } catch (err) {
      console.error("❌ 更新 checklist 內容失敗", err);
    }
  };

  // ✅ 新增 checklist 並記錄 updated_at
  const addChecklistItem = async () => {
    if (!newChecklistItem) return;
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("task_checklists")
        .insert([{
          task_id: taskId,
          content: newChecklistItem,
          is_done: false,
          updated_at: now
        }])
        .select("*")
        .single();

      if (error) throw error;
      setChecklist((prev) => [...prev, data]);
      setNewChecklistItem("");
    } catch (err) {
      console.error("❌ 新增 checklist 失敗", err);
    }
  };

  const deleteChecklistItem = async (itemId) => {
    try {
      await supabase.from("task_checklists").delete().eq("id", itemId);
      setChecklist((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      console.error("❌ 刪除 checklist 失敗", err);
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("確定要刪除這個任務嗎？");
    if (!isConfirmed) return;

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (!error) {
      alert("✅ 任務已刪除");
      onClose();
    } else {
      alert("刪除失敗，請稍後再試！");
    }
  };

  // ✅ 完成全部 checklist 並記錄 completed_at
  const handleComplete = async () => {
    if (checklist.length === 0) return;
    const now = new Date().toISOString();

    try {
      await Promise.all(
        checklist.map((item) =>
          supabase
            .from("task_checklists")
            .update({ is_done: true, completed_at: now })
            .eq("id", item.id)
        )
      );

      setChecklist((prev) => prev.map((item) => ({ ...item, is_done: true, completed_at: now })));
      alert("✅ 所有待辦事項已完成！");
      onClose();
    } catch (err) {
      console.error("❌ 更新 checklist 失敗", err);
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
        <button className={styles.taskdetail_completeButton} onClick={handleComplete}>完成任務</button>
      </div>
    </div>
  );
};

export default TaskDetail;

