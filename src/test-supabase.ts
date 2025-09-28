// Test file to verify Supabase connection
import { supabase } from './lib/supabase';

async function testSupabaseConnection() {
  try {
    console.log('🔌 Testing Supabase connection...');
    
    // Test basic connection
    const { data, error } = await supabase
      .from('companies')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database is accessible');
    
    // Test authentication
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('⚠️ No active session (expected for first run)');
    } else {
      console.log('✅ Authentication system ready');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
}

// Run the test
testSupabaseConnection().then(success => {
  if (success) {
    console.log('🎉 All systems ready! You can now use the app with Supabase.');
  } else {
    console.log('💥 Setup incomplete. Please check your environment variables.');
  }
});

export default testSupabaseConnection;
