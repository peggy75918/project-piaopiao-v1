import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://huwmtzqyvpzytjifdruk.supabase.co"; // 你的 Supabase URL
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d210enF5dnB6eXRqaWZkcnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NzU3NTksImV4cCI6MjA1NjQ1MTc1OX0.chQAGWv44eey-ej1ypGTgn5c4hrUyfYmRUjkdYKc8e0"; // 你的 API 金鑰

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
