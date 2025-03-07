import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import Topbar from "../components/Topbar";

function Personal() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            const storedLineId = localStorage.getItem("line_id");

            if (!storedLineId) {
                console.error("❌ 找不到 `line_id`，無法加載專案");
                setLoading(false);
                return;
            }

            // 查詢當前使用者的專案
            const { data, error } = await supabase
                .from("projects")
                .select("id, name")
                .eq("owner_id", storedLineId);

            if (error) {
                console.error("❌ 讀取專案失敗", error);
            } else {
                setProjects(data);
            }

            setLoading(false);
        };

        fetchProjects();
    }, []);

    return (
        <div>
            <Topbar />
            <div style={{ padding: "20px" }}>
                <p>前往其他可用專案</p>
                {loading ? (
                    <p>載入中...</p>
                ) : projects.length > 0 ? (
                    <ul>
                        {projects.map((project) => (
                            <li key={project.id} style={{ marginBottom: "10px" }}>
                                <Link 
                                    to={`/progress/${project.id}`} 
                                    style={{ textDecoration: "none", color: "#246D9D" }}
                                >
                                    {project.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>⚠️ 目前沒有額外專案</p>
                )}
            </div>
        </div>
    );
}

export default Personal;
