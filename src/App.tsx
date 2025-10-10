
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

  // TEMPORARY: Force authentication for testing
  const forceAuthenticated = true;
  const forceUser = {
    id: 'dev-1',
    email: 'developer@hgvbuddy.com',
    firstName: 'Developer',
    lastName: 'Admin',
    role: 'admin' as const,
  };

  // Auto-login for development - ENABLED for testing
  useEffect(() => {
    console.log('🔍 App useEffect - isAuthenticated:', isAuthenticated);
    console.log('🔍 App useEffect - user:', user);
    
    // Force auto-login for testing - bypass all checks
    const defaultUser = {
      id: 'dev-1',
      email: 'developer@hgvbuddy.com',
      firstName: 'Developer',
      lastName: 'Admin',
      role: 'admin' as const,
    };
    
    console.log('🛠️ Force auto-logging in as admin...');
    dispatch(setUser(defaultUser));
    console.log('✅ Development Mode: Force auto-logged in as Admin');
  }, [dispatch]);

  // Preload common components for better performance
  useEffect(() => {
    if (isAuthenticated) {
      preloadCommonComponents();
    }
  }, [isAuthenticated]);

  console.log('🔍 App render - isAuthenticated:', isAuthenticated, 'user:', user);
  console.log('🔍 Force authenticated:', forceAuthenticated);
  
  if (!forceAuthenticated && !isAuthenticated) {
    console.log('🔍 Showing login screen');
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
          <Dashboard user={forceUser} />
        </Layout>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;