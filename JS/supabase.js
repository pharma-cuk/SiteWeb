// ==== Connexion à Supabse ===
const SUPABASE_URL = "https://ohqgbojfjjowjayycpph.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ocWdib2pmampvd2pheXljcHBoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzODk5NzQsImV4cCI6MjA3MTk2NTk3NH0.9Av1dlKszmkrX3z81m3pAB4fZARXH0PcxG_TLSXfsK8";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);