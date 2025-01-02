import { createClient } from '@supabase/supabase-js';
import { configManager } from '../config/env';

const config = configManager.getConfig();
export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey
);
