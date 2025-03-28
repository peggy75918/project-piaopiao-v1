import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import styles from "./resourcecard.module.css";

const ResourceCard = ({ resource, currentUserId, selectedTag, onSelectTag, onDelete }) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [replies, setReplies] = useState([]);
  const [replyInput, setReplyInput] = useState("");
  const [authorName, setAuthorName] = useState("未命名使用者");
  const [replyUsers, setReplyUsers] = useState({});
  const likeButtonRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: likes }, { data: repliesData }, { data: user }] = await Promise.all([
        supabase.from("resource_likes").select("*").eq("resource_id", resource.id),
        supabase
          .from("resource_replies")
          .select("*")
          .eq("resource_id", resource.id)
          .order("created_at", { ascending: true }),
        supabase.from("users").select("name").eq("line_id", resource.user_id).maybeSingle(),
      ]);

      setLikeCount(likes?.length || 0);
      setLiked(likes?.some((l) => l.user_id === currentUserId));
      setReplies(repliesData || []);
      if (user) setAuthorName(user.name || "未命名使用者");

      const uniqueUserIds = [...new Set(repliesData?.map((r) => r.user_id))];
      if (uniqueUserIds.length > 0) {
        const { data: replyUserData } = await supabase
          .from("users")
          .select("line_id, name, picture")
          .in("line_id", uniqueUserIds);
        const userMap = {};
        replyUserData?.forEach((u) => {
          userMap[u.line_id] = u;
        });
        setReplyUsers(userMap);
      }
    };

    fetchData();
  }, [resource.id, currentUserId]);

  const handleLike = async () => {
    if (liked) {
      const { error } = await supabase
        .from("resource_likes")
        .delete()
        .eq("resource_id", resource.id)
        .eq("user_id", currentUserId);
      if (error) return console.error("❌ 取消讚失敗:", error.message);
    } else {
      const { error } = await supabase.from("resource_likes").insert([
        {
          resource_id: resource.id,
          user_id: currentUserId,
          created_at: new Date().toISOString(),
        },
      ]);
      if (error) return console.error("❌ 點讚失敗:", error.message);

      if (likeButtonRef.current) {
        likeButtonRef.current.classList.add(styles.animate);
        setTimeout(() => {
          likeButtonRef.current.classList.remove(styles.animate);
        }, 300);
      }
    }

    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleReply = async () => {
    if (!replyInput.trim()) return;

    const { error } = await supabase.from("resource_replies").insert([
      {
        resource_id: resource.id,
        user_id: currentUserId,
        content: replyInput,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("❌ 留言失敗:", error.message);
      alert("留言失敗：" + error.message);
      return;
    }

    if (!replyUsers[currentUserId]) {
      const { data: self } = await supabase
        .from("users")
        .select("line_id, name, picture")
        .eq("line_id", currentUserId)
        .maybeSingle();
      if (self) {
        setReplyUsers((prev) => ({
          ...prev,
          [self.line_id]: self,
        }));
      }
    }

    setReplies((prev) => [
      ...prev,
      {
        id: Date.now(),
        user_id: currentUserId,
        content: replyInput,
        created_at: new Date().toISOString(),
      },
    ]);
    setReplyInput("");
  };

  const handleDeleteReply = async (replyId) => {
    const confirmed = window.confirm("確定要刪除這則留言嗎？");
    if (!confirmed) return;

    const { error } = await supabase.from("resource_replies").delete().eq("id", replyId);
    if (error) {
      console.error("❌ 刪除留言失敗:", error.message);
      alert("刪除失敗：" + error.message);
      return;
    }

    setReplies((prev) => prev.filter((r) => r.id !== replyId));
  };

  const handleDeleteResource = async () => {
    const confirmed = window.confirm("確定要刪除此資源嗎？所有留言與讚也會被一併刪除");
    if (!confirmed) return;

    const [{ error: deleteRepliesError }, { error: deleteLikesError }, { error: deleteResourceError }] = await Promise.all([
      supabase.from("resource_replies").delete().eq("resource_id", resource.id),
      supabase.from("resource_likes").delete().eq("resource_id", resource.id),
      supabase.from("shared_resources").delete().eq("id", resource.id),
    ]);

    if (deleteRepliesError || deleteLikesError || deleteResourceError) {
      console.error("❌ 刪除時發生錯誤：", deleteRepliesError || deleteLikesError || deleteResourceError);
      alert("刪除失敗，請稍後再試");
      return;
    }

    if (onDelete) onDelete(resource.id); // 通知父層刪除畫面上這筆資料
  };

  return (
    <> 
        <div className={styles.resourcecard_card}>
            <div className={styles.resourcecard_header}>
              <div className={styles.resourcecard_topbox}>
                <div className={styles.resourcecard_topbox_start}>
                  <h3 className={styles.resourcecard_title}>{resource.title}</h3>
                  <a href={resource.link} target="_blank" rel="noreferrer" style={{ fontSize: "18px" }}>
                    🔗{" "}
                  </a>
                </div>
                <p className={styles.resourcecard_author}>{authorName}</p>
              </div>
              {resource.tag && (
                  <div
                      className={styles.resourcecard_tag}
                      style={{
                      color: selectedTag === resource.tag ? "white" : "#153448",
                      backgroundColor: selectedTag === resource.tag ? "#153448" : "#e0e0e0",
                      }}
                      onClick={() => onSelectTag(resource.tag)}
                  >
                      #{resource.tag}
                  </div>
                )}              
            </div>
            
            {resource.description && <p>{resource.description}</p>}
            <div className={styles.resourcecard_btmbox}>
              <div className={styles.resourcecard_actions}>
                <button onClick={handleLike} ref={likeButtonRef}>
                {liked ? "💙 已讚" : "🤍 點讚"}（{likeCount}）
                </button>
              </div>
              {resource.user_id === currentUserId && (
                <button
                    style={{ fontSize: "0.8rem", background: "none", color: "#c00", border: "none", cursor: "pointer" }}
                    onClick={handleDeleteResource}
                >
                    刪除資源
                </button>
              )}
            </div>
            

            <div className={styles.resourcecard_comments}>
                {replies.map((reply) => {
                const user = replyUsers[reply.user_id] || {};
                const createdAt = new Date(reply.created_at);
                const formattedTime = createdAt.toLocaleString("zh-TW", {
                    timeZone: "Asia/Taipei",
                    dateStyle: "short",
                    timeStyle: "short",
                });

                return (
                    <div key={reply.id} className={styles.resourcecard_comment}>
                    <strong>
                        {user.picture && (
                        <img
                            src={user.picture}
                            alt="頭像"
                            style={{
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            marginRight: "4px",
                            verticalAlign: "middle",
                            }}
                        />
                        )}
                        {user.name || reply.user_id}
                    </strong>
                    ：{reply.content}
                    <span style={{ marginLeft: "10px", fontSize: "0.8rem", color: "#888" }}>
                        ({formattedTime})
                    </span>
                    {reply.user_id === currentUserId && (
                        <button
                        style={{
                            marginLeft: "8px",
                            fontSize: "0.8rem",
                            color: "#c00",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                        }}
                        onClick={() => handleDeleteReply(reply.id)}
                        >
                        刪除
                        </button>
                    )}
                    </div>
                );
                })}

                <div className={styles.resourcecard_commentForm}>
                <input
                    type="text"
                    placeholder="留言..."
                    value={replyInput}
                    onChange={(e) => setReplyInput(e.target.value)}
                />
                <button onClick={handleReply}>送出</button>
                </div>
            </div>
            </div>
    </>
    
  );
};

export default ResourceCard;







