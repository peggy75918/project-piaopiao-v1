import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import ResourceForm from "../components/ResourceForm";
import ResourceCard from "../components/ResourceCard";
import Topbar from "../components/Topbar";
import styles from "./cloud.module.css";

const Cloud = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    const lineId = localStorage.getItem("line_id");
    const storedProjectId = localStorage.getItem("project_id");

    if (lineId) setCurrentUserId(lineId);
    if (storedProjectId) setProjectId(storedProjectId);

    fetchResources(storedProjectId, selectedTag);
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchResources(projectId, selectedTag);
    }
  }, [selectedTag]);

  const fetchResources = async (projectId, tag) => {
    setLoading(true);

    let query = supabase
      .from("shared_resources")
      .select("*, users(name)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (tag) {
      query = query.eq("tag", tag);
    }

    const { data, error } = await query;

    if (!error) {
      setResources(data);
    } else {
      console.error("❌ 載入資源失敗：", error.message);
    }

    setLoading(false);
  };

  const handleSelectTag = (tag) => {
    setSelectedTag((prev) => (prev === tag ? null : tag)); // toggle
  };

  const handleDeleteResource = (deletedId) => {
    setResources((prev) => prev.filter((r) => r.id !== deletedId));
  };

  return (
    <div className={styles.container}>
      <Topbar />

      <ResourceForm
        currentUserId={currentUserId}
        projectId={projectId}
        onSubmitSuccess={() => fetchResources(projectId, selectedTag)}
      />

      {loading ? (
        <p className={styles.loading}>載入中...</p>
      ) : (
        <div className={styles.list}>
          {resources.length > 0 ? (
            resources.map((res) => (
              <ResourceCard
                key={res.id}
                resource={res}
                currentUserId={currentUserId}
                selectedTag={selectedTag}
                onSelectTag={handleSelectTag}
                onDelete={handleDeleteResource}
              />
            ))
          ) : (
            <p className={styles.empty}>尚無分享資源，快來新增吧！</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Cloud;


