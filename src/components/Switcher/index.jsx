import { useState } from "react";

function Switcher({ stageCount, selectedStage, setSelectedStage }) {
  const handleStageChange = (event) => {
    setSelectedStage(parseInt(event.target.value, 10)); // 更新階段數
  };

  return (
    <div style={{ margin: "15px", textAlign: "center" }}>
      <label style={{ fontSize: "16px", marginRight: "10px" }}>當前階段：</label>
      <select
        value={selectedStage}
        onChange={handleStageChange}
        style={{
          fontSize: "16px",
          padding: "5px",
          borderRadius: "4px",
          border: "1px solid #ccc",
        }}
      >
        {[...Array(stageCount)].map((_, index) => (
          <option key={index + 1} value={index + 1}>
            第 {index + 1} 階段
          </option>
        ))}
      </select>
    </div>
  );
}

export default Switcher;
