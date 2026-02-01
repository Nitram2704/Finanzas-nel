import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase URL and Anon Key from the dashboard
const supabaseUrl = 'https://rjugrjskaagovhgwwjom.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqdWdyanNrYWFnb3ZoZ3d3am9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTg5NzMsImV4cCI6MjA4NTI3NDk3M30.6MFdHUs2cyWim4OZ7wM1Cle7PgTqY0O-E7SoIJC8k4c';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
    },
});
