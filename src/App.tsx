import { useSelector, useDispatch } from "react-redux";
import { useEffect, Suspense, useState } from "react";
import { Box } from "@mui/material";
import { RootState } from "./store";
import { setUser } from "./store/slices/authSlice";
import { DynamicComponents, LoadingSpinner, preloadCommonComponents } from "./utils/dynamicImports";
import ErrorBoundary from "./components/ErrorBoundary";

// Destructure the components we need
const { Layout, Login, Dashboard } = DynamicComponents;

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check for existing Supabase session on mount
  useEffect(() => {
    const checkSupabaseSession = async () => {
      try {
        const { supabase } = await import('./lib/supabase');
        
        // Check for existing session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error checking session:', error);
          setCheckingSession(false);
          return;
        }

        if (session?.user) {
          console.log('✅ Supabase session found:', session.user.id);
          
          // Get user details from users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            const user = {
              id: userData.id,
              email: userData.email || session.user.email || '',
              firstName: userData.first_name || 'User',
              lastName: userData.last_name || '',
              role: userData.role as any,
            };
            
            dispatch(setUser(user));
            console.log('✅ User session restored from Supabase:', user);
          } else {
            // Fallback to auth metadata
            const user = {
              id: session.user.id,
              email: session.user.email || '',
              firstName: session.user.user_metadata?.first_name || session.user.email?.split('@')[0] || 'User',
              lastName: session.user.user_metadata?.last_name || '',
              role: (session.user.user_metadata?.role || 'admin') as any,
            };
            
            dispatch(setUser(user));
            console.log('✅ User session restored from auth metadata:', user);
          }
        } else {
          console.log('⚠️ No Supabase session found');
        }
      } catch (error) {
        console.error('❌ Error checking Supabase session:', error);
      } finally {
        setCheckingSession(false);
      }
    };

    checkSupabaseSession();
  }, [dispatch]);

  // Preload common components for better performance
  useEffect(() => {
    if (isAuthenticated) {
      preloadCommonComponents();
    }
  }, [isAuthenticated]);

  // Show loading spinner while checking session
  if (checkingSession) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Layout>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
              <LoadingSpinner />
            </Box>
          </Layout>
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Layout>
            <Login />
          </Layout>
        </Suspense>
      </ErrorBoundary>
    );
  }

  // Show dashboard if authenticated
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Layout>
          <Dashboard user={user} />
        </Layout>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;