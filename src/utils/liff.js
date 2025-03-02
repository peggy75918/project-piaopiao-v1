import liff from "@line/liff";

export const initLiff = async () => {
  try {
    await liff.init({ liffId: "2006969123-1ngZVnLj" });
    if (!liff.isLoggedIn()) {
      liff.login();
    }
    const profile = await liff.getProfile();
    return {
      line_id: profile.userId,
      name: profile.displayName,
    };
  } catch (error) {
    console.error("LIFF 初始化失敗", error);
  }
};
