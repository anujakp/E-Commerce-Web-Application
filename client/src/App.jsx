import { useState } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import Store from "./pages/Store.jsx";

export default function App() {
  const { user, loading } = useAuth();
  const [view, setView] = useState("store");

  if (loading) {
    return <div className="loading-screen">Loading ShopSphere...</div>;
  }

  if (!user) return <AuthPage />;

  return (
    <Store
      view={view}
      setView={setView}
    />
  );
}
