import liff from "@line/liff";
import { supabase } from "../lib/supabase";

const LIFF_ID = import.meta.env.MODE === "development"
  ? import.meta.env.VITE_LIFF_ID_DEV
  : import.meta.env.VITE_LIFF_ID_PROD;

const LIFF_REDIRECT_URI = import.meta.env.MODE === "development"
  ? import.meta.env.VITE_LIFF_REDIRECT_DEV
  : import.meta.env.VITE_LIFF_REDIRECT_PROD;

export const initLiff = async () => {
  try {
    console.log("🚀 初始化 LIFF...");
    await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser: true });

    if (!liff.isLoggedIn()) {
      console.warn("⚠️ 尚未登入，進行 LIFF 登入...");
      liff.login({ redirectUri: LIFF_REDIRECT_URI });
      return;
    }

    console.log("✅ 已登入 LIFF，開始獲取使用者資訊...");
    const profile = await liff.getProfile();

    if (!profile) {
      throw new Error("❌ `liff.getProfile()` 失敗，沒有回傳 `profile`");
    }

    console.log("🔍 LINE 使用者資訊：", profile);

    // **使用 `upsert()` 確保 `line_id` 存在則更新，不存在則插入**
    console.log("📝 嘗試插入或更新 `users` 資料表...");
    const { data, error } = await supabase.from("users").upsert([
      {
        line_id: profile.userId,
        name: profile.displayName,
        picture: profile.pictureUrl,
      }
    ]).select();

    if (error) {
      console.error("❌ `supabase.upsert()` 失敗！", error);
    } else {
      console.log("✅ 使用者成功寫入 Supabase！", data);
    }

    // **儲存 `line_id` 到 `localStorage`，避免重複查詢**
    localStorage.setItem("line_id", profile.userId);

    return {
      line_id: profile.userId,
      name: profile.displayName,
      picture: profile.pictureUrl,
    };
  } catch (error) {
    console.error("❌ LIFF 初始化失敗", error);
    return null;
  }
};








