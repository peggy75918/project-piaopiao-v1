import { useEffect,useState } from 'react'
import { supabase } from "../lib/supabase";
import { Link } from 'react-router-dom';
import { EditOutlined } from "@ant-design/icons"
import imgwall from '../assets/鼓勵牆.png'
import imgtasklist from '../assets/任務清單.png'
import imgprogressRate from '../assets/進度追蹤.png'
import imgcloud from '../assets/共用雲端.png'
import imgsuggestion from '../assets/建議箱.png'
import imgnotification from '../assets/通知設定.png'
import imgpersonal from '../assets/個人專案管理.png'
import styles from './home.module.css'

function Home() {
  const [user, setUser] = useState(null);
  const [text, setText] = useState('專案名稱');
  const [isEditing, setIsEditing] = useState(false);

  const [progress, setProgress] = useState(30); // 進度百分比
  const maskHeight = `${100-Math.floor(progress / 10) * 10}%`;// 計算牆的遮罩高度（每 10% 遮住一層）

  useEffect(() => {
    const fetchUser = async () => {
      const storedLineId = localStorage.getItem("line_id");
      if (!storedLineId) {
        console.error("❌ 找不到 `line_id`，可能尚未登入");
        return;
      }

      console.log("📢 查詢 Supabase 使用者資料...");
      const { data, error } = await supabase
        .from("users")
        .select("line_id, name, picture")
        .eq("line_id", storedLineId)
        .maybeSingle();

      if (error) {
        console.error("❌ 讀取 Supabase 使用者資料失敗", error);
      } else if (!data) {
        console.warn("⚠️ 沒有找到對應的 `line_id` 使用者");
      } else {
        console.log("✅ Supabase 使用者資料:", data);
        setUser(data);
      }
    };

    fetchUser();
  }, []);
  
  return (
    <>
      <div className={styles.home_pj_name_box}>
        {isEditing ? (
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            className={{
              height: "23px",
              width: "150px",
              paddingLeft: "4px",
              fontSize: "16px",
              border: "1px solid #93B1C3",
              borderRadius: "6px",
              outline: "none",
            }}
          />
        ) : (
          <p className={styles.home_project_name}>{text}</p>
        )}
        <EditOutlined 
          className={styles.home_edit_icon}
          style={{ fontSize: "17px", color: "#93B1C3", cursor: "pointer" }} 
          onClick={() => setIsEditing(true)}
        />
      </div>
      <div className={styles.home_encouragement_wall}>
        <img src={imgwall} className={styles.home_wall} alt="wall" />
        <div className={styles.home_wall_mask} style={{ height: maskHeight }} />
        <p className={styles.home_wall_text}>專案進度：{progress}%</p>
      </div>
      <div className={styles.home_option}>
        <Link to={'/tasklist'}>
          <div className={styles.home_op1}>
            <img src={imgtasklist} className={styles.home_op_img} alt="tasklist" />
            <p className={styles.home_op_text}>任務清單</p>
           </div>
        </Link>
        <Link to={'/progress'}>
          <div className={styles.home_op2}>
            <img src={imgprogressRate} className={styles.home_op_img} alt="progressRate" />
            <p className={styles.home_op_text}>進度追蹤</p>
          </div>
        </Link>
        <Link to={'/cloud'}>
          <div className={styles.home_op2}>
            <img src={imgcloud} className={styles.home_op_img} alt="cloud" />
            <p className={styles.home_op_text}>共用雲端</p>
          </div>
        </Link>
        <Link to={'/suggestion'}>
          <div className={styles.home_op1}>
            <img src={imgsuggestion} className={styles.home_op_img} alt="suggestion" />
            <p className={styles.home_op_text}>建議箱</p>
          </div>
        </Link>
        <Link to={'/notification'}>
          <div className={styles.home_op1}>
            <img src={imgnotification} className={styles.home_op_img} alt="notification" />
            <p className={styles.home_op_text}>通知設定</p>
          </div>
        </Link>
        <Link to={'/personal'}>
          <div className={styles.home_op2}>
            <img src={imgpersonal} className={styles.home_op_img} alt="personal" />
            <p className={styles.home_op_text}>個人專案管理</p>
          </div>
        </Link>
      </div>

      {/* 進度控制按鈕 */}
      <button onClick={() => setProgress(progress + 10)} disabled={progress >= 100}>
        增加進度
      </button>
      <button onClick={() => setProgress(progress - 10)} disabled={progress <= 0}>
        減少進度
      </button>

      <div>
        <h1>LINE 登入測試</h1>
        {user ? (
          <div>
            <p>👤 {user.name}</p>
            <img src={user.picture} alt="頭像" width="100" />
          </div>
        ) : (
          <p>載入中...</p>
        )}
      </div>
    </>
  )
}

export default Home