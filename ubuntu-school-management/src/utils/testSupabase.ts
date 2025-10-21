import { supabase } from '../supabaseClient';

export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    
    // Test basic connection
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth user:', user);
    console.log('Auth error:', authError);
    
    // Test if we can query profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    console.log('Profiles query result:', profiles);
    console.log('Profiles error:', profilesError);
    
    // Test if RPC function exists
    try {
      const { data: rpcTest, error: rpcError } = await supabase.rpc('onboard_school_and_admin', {
        p_user_id: '00000000-0000-0000-0000-000000000000',
        p_school_name: 'test',
        p_school_email: 'test@test.com',
        p_school_address: 'test',
        p_school_phone: 'test',
        p_school_logo: 'test',
        p_admin_full_name: 'test',
        p_admin_email: 'test@test.com'
      });
      console.log('RPC function exists:', rpcTest);
      console.log('RPC error (expected):', rpcError);
    } catch (rpcErr) {
      console.log('RPC function does not exist:', rpcErr);
    }
    
    return { user, profiles, profilesError };
  } catch (error) {
    console.error('Supabase test failed:', error);
    return { error };
  }
};
