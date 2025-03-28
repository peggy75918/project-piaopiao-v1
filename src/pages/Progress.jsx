import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Topbar from "../components/Topbar";
import styles from "./progress.module.css";

function Progress() {
    const { projectId: paramProjectId } = useParams();
    const navigate = useNavigate();
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);

    const projectId = paramProjectId || localStorage.getItem("project_id");

    console.log("📌 目前 `projectId`:", projectId);

    useEffect(() => {
        if (!projectId) {
            console.error("❌ `projectId` 為 undefined，導向 `/home`...");
            navigate("/home");
            return;
        }

        const fetchProjectData = async () => {
            setLoading(true);
            try {
                console.log("🔄 正在讀取專案資訊...");

                const { data: projectData, error: projectError } = await supabase
                    .from("projects")
                    .select("stage_count")
                    .eq("id", projectId)
                    .maybeSingle();

                if (projectError) throw projectError;
                if (!projectData || !projectData.stage_count) {
                    console.warn("⚠️ 此專案沒有 `stage_count`，可能是空的專案");
                    setLoading(false);
                    return;
                }

                const stageCount = projectData.stage_count;
                console.log("✅ 取得 `stage_count`:", stageCount);

                let stageTasks = [];

                for (let stage = 1; stage <= stageCount; stage++) {
                    console.log(`📖 讀取第 ${stage} 階段的任務...`);

                    const { data: tasks, error: taskError } = await supabase
                        .from("tasks")
                        .select(`
                            id, title, assignee_id, created_at, due_date,
                            task_checklists (is_done)
                        `)
                        .eq("project_id", projectId)
                        .eq("status", stage)
                        .order("created_at", { ascending: true });

                    if (taskError) throw taskError;
                    if (!tasks || tasks.length === 0) continue;

                    // **確保所有日期存在，避免 NaN**
                    const taskDates = tasks.map(t => ({
                        start: t.created_at ? new Date(t.created_at) : new Date(),
                        end: t.due_date ? new Date(t.due_date) : new Date()
                    }));

                    // **計算該階段的最早 `created_at` 與最晚 `due_date`**
                    const minDate = new Date(Math.min(...taskDates.map(t => t.start.getTime())));
                    const maxDate = new Date(Math.max(...taskDates.map(t => t.end.getTime())));
                    const stageDuration = maxDate - minDate || 1;  // 避免除以 0

                    console.log(`📅 階段 ${stage}:`, { minDate, maxDate, stageDuration });

                    const formattedTasks = await Promise.all(
                        tasks.map(async (task) => {
                            const completed = task.task_checklists?.filter(item => item.is_done).length || 0;
                            const total = task.task_checklists?.length || 0;
                            const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                            let assignee = null;
                            if (task.assignee_id) {
                                const { data: user, error: userError } = await supabase
                                    .from("users")
                                    .select("name, picture")
                                    .eq("line_id", task.assignee_id)
                                    .maybeSingle();

                                if (!userError && user) assignee = user;
                            }

                            // ✅ **根據該階段的時間區間，計算任務的 left (開始) & width (持續時間)**
                            const startDate = new Date(task.created_at);
                            const endDate = task.due_date ? new Date(task.due_date) : new Date();

                            const left = ((startDate - minDate) / stageDuration) * 100;
                            const duration = ((endDate - startDate) / stageDuration) * 100;

                            return {
                                id: task.id,
                                title: task.title,
                                startDate,
                                endDate,
                                progress,
                                assignee,
                                left: Math.max(0, left), // 避免負值
                                width: Math.max(5, duration), // 避免太短的條
                            };
                        })
                    );

                    stageTasks.push({
                        stage,
                        tasks: formattedTasks
                    });
                }

                setStages(stageTasks);
                console.log("✅ 成功載入所有階段與任務！", stageTasks);
            } catch (err) {
                console.error("❌ 讀取專案進度失敗", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProjectData();
    }, [projectId]);

    return (
        <div>
            <Topbar projectId={projectId} />
            <div className={styles.progress_container}>
                {loading ? (
                    <p>⏳ 載入中...</p>
                ) : stages.length > 0 ? (
                    stages.map((stageData) => (
                        <div key={stageData.stage} className={styles.progress_stageBlock}>
                            <p className={styles.progress_stageTitle}>第{stageData.stage}階段</p>
                            <div style={{backgroundColor:"#798777", width:"100%", height:"1px", marginTop:"3px"}}></div>
                            <div className={styles.progress_stageLine}></div>
                            {stageData.tasks.length > 0 ? (
                                stageData.tasks.map((task) => (
                                    <div key={task.id} className={styles.progress_taskItem}>
                                        <div className={styles.progress_assigneeAvatar}>
                                            {task.assignee ? (
                                                <img src={task.assignee.picture} alt={task.assignee.name} />
                                            ) : (
                                                <div className={styles.progress_placeholderAvatar} />
                                            )}
                                        </div>
                                        <div className={styles.progress_taskContent}>
                                            <p className={styles.progress_taskTitle}>{task.title}</p>
                                            <div className={styles.progress_ganttBar}>
                                                <div
                                                    className={styles.progress_ganttTask}
                                                    style={{ left: `${task.left}%`, width: `${task.width}%` }}
                                                >
                                                    <div className={styles.progress_ganttFill} style={{ width: `${task.progress}%` }} />
                                                </div>
                                            </div>
                                            <p className={styles.progress_taskDueDate}>
                                                {new Date(task.startDate.getTime() + 8 * 60 * 60 * 1000).toISOString().split("T")[0]} ~ {new Date(task.endDate.getTime() + 8 * 60 * 60 * 1000).toISOString().split("T")[0]}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className={styles.progress_noTask}>⚠️ 此階段尚無任務</p>
                            )}
                        </div>
                    ))
                ) : (
                    <p>⚠️ 目前無專案數據</p>
                )}
            </div>
        </div>
    );
}

export default Progress;







