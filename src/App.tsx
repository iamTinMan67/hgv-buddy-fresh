
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { RootState } from "./store";
import { setUser } from "./store/slices/authSlice";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Auth/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

  // Auto-login for development - bypasses login screen
  useEffect(() => {
    if (!isAuthenticated) {
      // Auto-login as admin for development with full access
      const defaultUser = {
        id: 'dev-1',
        email: 'developer@hgvbuddy.com',
        firstName: 'Developer',
        lastName: 'Admin',
        role: 'admin' as const,
      };
      
      dispatch(setUser(defaultUser));
      console.log('🛠️ Development Mode: Auto-logged in as Admin with full access');
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <Login />
      </Layout>
    );
  }

  return (
    <Layout>
      <Dashboard user={user} />
    </Layout>
  );
}

export default App;