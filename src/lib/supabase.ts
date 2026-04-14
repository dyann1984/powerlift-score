import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://pwzfztlqwbfwrjaynqna.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3emZ6dGxxd2Jmd3JqYXlucW5hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxODAzMDIsImV4cCI6MjA5MTc1NjMwMn0.2Oq9d7wsJSNaAYoGZsB-ScVuGrRaQnrC0mjor56puG4"
);