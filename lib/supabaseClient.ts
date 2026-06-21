import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dinygrtktvzkyqgutuft.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_8U32EhIlt5acTb9snonWyw_-GBElDCi';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
