import { useState } from "react";
import { Select } from "antd";
import './switcher.module.css'

const { Option } = Select;

const Switcher = () => {
  const [selectedContent, setSelectedContent] = useState("option1");

  return (
    <div>
      {/* 下拉式選單 */}
      <Select
        defaultValue="option1"
        style={{ width: 200 }}
        onChange={(value) => setSelectedContent(value)}
      >
        <Option value="option1">當前階段：第一階段</Option>
        <Option value="option2">當前階段：第二階段</Option>
        <Option value="option3">當前階段：第三階段</Option>
      </Select>

      {/* 根據選擇的內容顯示不同的區塊 */}
      <div className={{ marginTop: 20 }}>
        {selectedContent === "option1" && <p>這是 **內容 1**</p>}
        {selectedContent === "option2" && <p>這是 **內容 2**</p>}
        {selectedContent === "option3" && <p>這是 **內容 3**</p>}
      </div>
    </div>
  );
};

export default Switcher;