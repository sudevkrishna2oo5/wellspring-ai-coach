// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rfhkokggjvuvvfhlzomb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmaGtva2dnanZ1dnZmaGx6b21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxMzAxOTgsImV4cCI6MjA1OTcwNjE5OH0.7DpfTSPlJxVkKCcbFb-46pJmGnUSYG0pQvXglIJi8dY";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);