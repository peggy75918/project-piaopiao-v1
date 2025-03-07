import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import Topbar from '../components/Topbar';
import Switcher from '../components/Switcher';
import Taskcard from '../components/Taskcard';
import AddTask from '../components/AddTask';
import TaskDetail from '../components/TaskDetail';
import { PlusOutlined } from "@ant-design/icons";

function Tasklist() {
    const { projectId } = useParams();
    const navigate = useNavigate();

    const [stageCount, setStageCount] = useState(1);
    const [selectedStage, setSelectedStage] = useState(1);
    const [tasks, setTasks] = useState([]);
    const [showAddTask, setShowAddTask] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    // **🔍 確保 `projectId` 存在**
    useEffect(() => {
        if (!projectId) {
            console.error("❌ `projectId` 不存在，返回專案列表");
            navigate("/projects");
        }
    }, [projectId, navigate]);

    // **📢 讀取專案的階段數**
    useEffect(() => {
        const fetchProjectStages = async () => {
            if (!projectId) return;

            try {
                const { data, error } = await supabase
                    .from("projects")
                    .select("stage_count")
                    .eq("id", projectId)
                    .maybeSingle();

                if (error) throw error;
                if (data) setStageCount(data.stage_count);
            } catch (err) {
                console.error("❌ 讀取專案階段數失敗", err);
            }
        };

        fetchProjectStages();
    }, [projectId]);

    // **📢 讀取任務**
    const fetchTasks = async () => {
        if (!projectId) return;

        try {
            const { data, error } = await supabase
                .from("tasks")
                .select(`
                    id, title, assignee_id, due_date, description,
                    task_checklists(is_done) 
                `)
                .eq("project_id", projectId)
                .eq("status", selectedStage);

            if (error) throw error;

            // **📌 計算任務的完成度**
            const tasksWithProgress = data.map(task => {
                const checklist = task.task_checklists || [];
                const completedCount = checklist.filter(item => item.is_done).length;
                const totalCount = checklist.length;

                return {
                    ...task,
                    completedTasks: completedCount,
                    totalTasks: totalCount
                };
            });

            // **📌 排序任務**
            const sortedTasks = tasksWithProgress.sort((a, b) => {
                const today = new Date();
                const dueDateA = a.due_date ? new Date(a.due_date) : null;
                const dueDateB = b.due_date ? new Date(b.due_date) : null;

                const isACompleted = a.totalTasks > 0 && a.completedTasks === a.totalTasks;
                const isBCompleted = b.totalTasks > 0 && b.completedTasks === b.totalTasks;

                const isAOverdue = dueDateA && dueDateA < today;
                const isBOverdue = dueDateB && dueDateB < today;

                if (isACompleted && !isBCompleted) return 1;  
                if (!isACompleted && isBCompleted) return -1;
                if (isAOverdue && !isBOverdue) return -1; 
                if (!isAOverdue && isBOverdue) return 1;
                if (dueDateA && dueDateB) return dueDateA - dueDateB; 
                if (dueDateA) return -1;
                if (dueDateB) return 1;

                return 0;
            });

            setTasks(sortedTasks);
        } catch (err) {
            console.error("❌ 讀取任務失敗", err);
        }
    };

        
    useEffect(() => {
        fetchTasks();
    }, [projectId, selectedStage]); // **⬅ 加上 `projectId` 監聽，確保切換專案時重新載入**

    return (
        <div style={{ paddingBottom: "60px" }}>
            <Topbar projectId={projectId} />
            <Switcher 
                stageCount={stageCount} 
                selectedStage={selectedStage} 
                setSelectedStage={setSelectedStage} 
            />

            {!showAddTask ? (
                <>
                    {selectedTask ? (
                            <TaskDetail 
                                taskId={selectedTask} 
                                onEdit={() => setIsEditing(true)}
                                onClose={() => {
                                    setSelectedTask(null);
                                    fetchTasks();
                                }}
                            />
                    ) : (
                        <>
                            {tasks.length > 0 ? (
                                tasks.map(task => (
                                    <div 
                                        key={task.id} 
                                        style={{ marginBottom: "15px", cursor: "pointer" }} 
                                        onClick={() => {
                                            console.log("任務被點擊", task.id);
                                            setSelectedTask(task.id)
                                        }}
                                    > 
                                        <Taskcard task={task} />
                                    </div>
                                ))
                            ) : (
                                <p style={{
                                    textAlign: "center", 
                                    fontSize: "14px", 
                                    backgroundColor: "#E8F3F6", 
                                    color: "#153448", 
                                    borderRadius: "6px", 
                                    padding: "8px"
                                }}>
                                    此階段還沒有任務喔！點擊右下角+新增任務
                                </p>
                            )}

                            {/* 右下角新增按鈕 */}
                            <div 
                                style={{
                                    height: '60px',
                                    width: '60px',
                                    backgroundColor: '#153448',
                                    borderRadius: '50%',
                                    position: 'fixed',
                                    bottom: '31px',
                                    right: '31px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setShowAddTask(true)}
                            >
                                <PlusOutlined style={{ fontSize: '32px', color: 'white' }} />
                            </div>
                        </>
                    )}
                </>
            ) : (
                <AddTask 
                    onCancel={() => {
                        setShowAddTask(false)
                        fetchTasks();         
                    }} 
                    projectId={projectId}  
                    stage={selectedStage}  
                />
            )}
        </div>
    );
}

export default Tasklist;




