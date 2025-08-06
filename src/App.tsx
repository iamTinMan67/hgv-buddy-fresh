
import { useSelector } from "react-redux";
import { RootState } from "./store";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Auth/Login";
import Dashboard from "./components/Dashboard";

function App() {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);

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