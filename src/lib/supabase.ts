import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hwxzmawbblvrqxbolvoy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_iXAxXk8jZ34ZKbas1myfcg_5GZbz9cw';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
