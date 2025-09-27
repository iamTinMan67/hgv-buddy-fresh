
import { useSelector, useDispatch } from "react-redux";
import { useEffect, Suspense, useState } from "react";
import { RootState } from "./store";
import { setUser } from "./store/slices/authSlice";
import { DynamicComponents, LoadingSpinner, preloadCommonComponents } from "./utils/dynamicImports";
import ErrorBoundary from "./components/ErrorBoundary";

// Destructure the components we need
const { Layout, Login, Dashboard } = DynamicComponents;

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const [hasAutoLoggedIn, setHasAutoLoggedIn] = useState(false);

  // Auto-login for development - bypasses login screen (only once)
  useEffect(() => {
    if (!isAuthenticated && !hasAutoLoggedIn) {
      // Auto-login as admin for development with full access
      const defaultUser = {
        id: 'dev-1',
        email: 'developer@hgvbuddy.com',
        firstName: 'Developer',
        lastName: 'Admin',
        role: 'admin' as const,
      };
      
      dispatch(setUser(defaultUser));
      setHasAutoLoggedIn(true);
      console.log('🛠️ Development Mode: Auto-logged in as Admin with full access');
    }
  }, [isAuthenticated, dispatch, hasAutoLoggedIn]);

  // Preload common components for better performance
  useEffect(() => {
    if (isAuthenticated) {
      preloadCommonComponents();
    }
  }, [isAuthenticated]);

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