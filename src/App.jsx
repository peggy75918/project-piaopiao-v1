import { useState } from 'react'
import { EditOutlined } from "@ant-design/icons"
import wall from './assets/鼓勵牆（已完成）.png'
import './App.css'

function App() {
  const [text, setText] = useState('專案名稱');
  const [isEditing, setIsEditing] = useState(false);

  const [progress, setProgress] = useState(20); // 進度百分比
  const maskHeight = `${100-Math.floor(progress / 10) * 10}%`;// 計算牆的遮罩高度（每 10% 遮住一層）
  
  return (
    <>
      <div className='pj-name-box'>
        {isEditing ? (
          <input
            type='text'
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={() => setIsEditing(false)}
            autoFocus
            style={{
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
          <p className='project-name'>{text}</p>
        )}
        <EditOutlined 
          className='edit-icon'
          style={{ fontSize: "17px", color: "#93B1C3", cursor: "pointer" }} 
          onClick={() => setIsEditing(true)}
        />
      </div>
      <div className='encouragement-wall'>
        <img src={wall} className="wall" alt="wall" />
        <div className="wall-mask" style={{ height: maskHeight }} />
        <p className='wall-text'>專案進度：{progress}%</p>
      </div>
      <div className='option'>
        <div className='op1'><p className='op-text'>任務清單</p></div>
        <div className='op2'><p className='op-text'>進度追蹤</p></div>
        <div className='op1'><p className='op-text'>共用雲端</p></div>
        <div className='op2'><p className='op-text'>建議箱</p></div>
        <div className='op1'><p className='op-text'>通知設定</p></div>
        <div className='op2'><p className='op-text'>個人專案管理</p></div>
      </div>

      {/* 進度控制按鈕 */}
      <button onClick={() => setProgress(progress + 10)} disabled={progress >= 100}>
        增加進度
      </button>
      <button onClick={() => setProgress(progress - 10)} disabled={progress <= 0}>
        減少進度
      </button>
    </>
  )
}

export default App
