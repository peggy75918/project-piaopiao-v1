import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import SuggestionCard from "../components/SuggestionCard";
import Switcher from "../components/Switcher";
import Topbar from "../components/Topbar";

const Suggestion = () => {
  const [tasks, setTasks] = useState([]);
  const [stageCount, setStageCount] = useState(1);
  const [selectedStage, setSelectedStage] = useState(1);
  const [loading, setLoading] = useState(true);

  const projectId = localStorage.getItem("project_id");
  const lineId = localStorage.getItem("line_id");

  useEffect(() => {
    fetchStageCount();
  }, []);

  useEffect(() => {
    fetchCompletedTasksByStage();
  }, [selectedStage]);

  const fetchStageCount = async () => {
    const { data, error } = await supabase
      .from("projects")
      .select("stage_count")
      .eq("id", projectId)
      .maybeSingle();

    if (!error && data?.stage_count) {
      setStageCount(data.stage_count);
    }
  };

  const fetchCompletedTasksByStage = async () => {
    setLoading(true);

    const { data: taskData, error } = await supabase
      .from("tasks")
      .select("id, title, assignee_id, description, status")
      .eq("project_id", projectId)
      .eq("status", selectedStage);

    if (error) {
      console.error("❌ 任務讀取失敗：", error);
      setLoading(false);
      return;
    }

    const completedTasks = [];

    for (const task of taskData) {
      const { data: checklist } = await supabase
        .from("task_checklists")
        .select("is_done")
        .eq("task_id", task.id);

      const allDone = checklist.length > 0 && checklist.every((c) => c.is_done);
      if (allDone) completedTasks.push(task);
    }

    setTasks(completedTasks);
    setLoading(false);
  };

  return (
    <div style={{ paddingBottom: "60px" }}>
      <Topbar />
      <Switcher
        stageCount={stageCount}
        selectedStage={selectedStage}
        setSelectedStage={setSelectedStage}
      />

      {loading ? (
        <p style={{ textAlign: "center" }}>⏳ 載入中...</p>
      ) : tasks.length === 0 ? (
        <p style={{ textAlign: "center" }}>此階段尚無已完成的任務</p>
      ) : (
        tasks.map((task) => (
          <SuggestionCard key={task.id} task={task} currentUser={lineId} />
        ))
      )}
    </div>
  );
};

export default Suggestion;
