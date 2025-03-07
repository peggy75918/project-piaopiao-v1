import liff from "@line/liff";
import { supabase } from "../lib/supabase";

const LIFF_ID = import.meta.env.MODE === "development"
  ? import.meta.env.VITE_LIFF_ID_DEV
  : import.meta.env.VITE_LIFF_ID_PROD;

export const initLiff = async () => {
  try {
    console.log("🚀 初始化 LIFF...");
    await liff.init({ liffId: LIFF_ID, withLoginOnExternalBrowser: true });

    if (!liff.isLoggedIn()) {
      console.warn("⚠️ 尚未登入，進行 LIFF 登入...");
      liff.login();
      return;
    }

    console.log("✅ 已登入 LIFF，開始獲取使用者資訊...");
    const profile = await liff.getProfile();

    if (!profile) {
      throw new Error("❌ `liff.getProfile()` 失敗，沒有回傳 `profile`");
    }

    console.log("🔍 LINE 使用者資訊：", profile);
    const userId = profile.userId;

    // **先檢查是否已經存在該 `line_id`**
    console.log("📢 檢查使用者是否已存在...");
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("line_id")
      .eq("line_id", userId)
      .maybeSingle();

    if (checkError) {
      console.error("❌ 查詢 `users` 失敗！", checkError);
    }

    if (existingUser) {
      console.log("✅ 使用者已存在，更新資料...");
      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: profile.displayName,
          picture: profile.pictureUrl,
        })
        .eq("line_id", userId);

      if (updateError) {
        console.error("❌ 更新 `users` 失敗！", updateError);
      } else {
        console.log("✅ 使用者資料更新成功！");
      }
    } else {
      console.log("📝 使用者不存在，插入新資料...");
      const { error: insertError } = await supabase
        .from("users")
        .insert([
          {
            line_id: userId,
            name: profile.displayName,
            picture: profile.pictureUrl,
          },
        ]);

      if (insertError) {
        console.error("❌ 插入 `users` 失敗！", insertError);
      } else {
        console.log("✅ 使用者成功寫入 Supabase！");
      }
    }

    // **儲存 `line_id` 到 `localStorage`**
    localStorage.setItem("line_id", userId);

    return {
      line_id: userId,
      name: profile.displayName,
      picture: profile.pictureUrl,
    };
  } catch (error) {
    console.error("❌ LIFF 初始化失敗", error);
    return null;
  }
};









