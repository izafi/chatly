import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Authentication check ho rahi hai
  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090C] flex items-center justify-center">
        <div className="text-purple-400 text-lg">
          Loading...
        </div>
      </div>
    );
  }

  // User login nahi hai
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User authenticated hai
  return children;
};

export default ProtectedRoute;