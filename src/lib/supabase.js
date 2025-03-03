import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://huwmtzqyvpzytjifdruk.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1d210enF5dnB6eXRqaWZkcnVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA4NzU3NTksImV4cCI6MjA1NjQ1MTc1OX0.chQAGWv44eey-ej1ypGTgn5c4hrUyfYmRUjkdYKc8e0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);