import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./layouts/ProtectedRoute";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Scout from "./pages/Scout";
import OpportunityDetail from "./pages/OpportunityDetail";
import Comparison from "./pages/Comparison";
import SavedOpportunities from "./pages/SavedOpportunities";
import BusinessPlansList from "./pages/BusinessPlansList";
import BusinessPlanPage from "./pages/BusinessPlanPage";
import Profile from "./pages/Profile";
import Subscription from "./pages/Subscription";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scout"
            element={
              <ProtectedRoute>
                <Scout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/opportunities/:id"
            element={
              <ProtectedRoute>
                <OpportunityDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <Comparison />
              </ProtectedRoute>
            }
          />
          <Route
            path="/saved"
            element={
              <ProtectedRoute>
                <SavedOpportunities />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans"
            element={
              <ProtectedRoute>
                <BusinessPlansList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/plans/:id"
            element={
              <ProtectedRoute>
                <BusinessPlanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subscription"
            element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
