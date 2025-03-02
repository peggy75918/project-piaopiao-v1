import { useState } from "react";
import { Drawer, Button, Menu } from "antd";
import { MenuUnfoldOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import styles from "./topbar.module.css";

const Topbar = () => {
  const [visible, setVisible] = useState(false);

  return (
    <div className={styles.topbar}>
      <Button onClick={() => setVisible(true)} icon={<MenuUnfoldOutlined />} />

      <Drawer title="功能選單" placement="left" onClose={() => setVisible(false)} open={visible}>
        <Menu mode="vertical">
          <Menu.Item key="1">
            <Link to={'/tasklist'}>任務清單</Link>
          </Menu.Item>
          <Menu.Item key="2">
            <Link to={'/progress'}>進度追蹤</Link>
          </Menu.Item>
          <Menu.Item key="3">
            <Link to={'/cloud'}>共用雲端</Link>
          </Menu.Item>
          <Menu.Item key="4">
            <Link to={'/suggestion'}>建議箱</Link>
          </Menu.Item>
          <Menu.Item key="5">
            <Link to={'/notification'}>通知設定</Link>
          </Menu.Item>
          <Menu.Item key="6">
            <Link to={'/personal'}>個人專案管理</Link>
          </Menu.Item>
        </Menu>
      </Drawer>

      <p className={styles.topbar_project_name}>專案名稱</p>
      <div className={styles.topbar_space}></div>
    </div>
  );
};

export default Topbar;
