import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kywgolxzufszotzoofqi.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5d2dvbHh6dWZzem90em9vZnFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4NDgxMjgsImV4cCI6MjA3MjQyNDEyOH0.g6gqOpUdm8lSuY5JqE9fO2I-u-xLN42xl0QUnyytxD0";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
