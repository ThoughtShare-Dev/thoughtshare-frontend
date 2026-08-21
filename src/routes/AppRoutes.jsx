import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";
import Settings from "../features/Settings/Settings.jsx";
import Landing from "../pages/Landing.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";
import Login from "../features/auth/Login.jsx";
import Register from "../features/auth/Register.jsx";
import PlaceholderPage from "../components/PlaceholderPage.jsx";

// Dev 2 — Profile & Discovery
import SearchPage from "../features/search/SearchPage.jsx";
import SearchResultsPage from "../features/search/SearchResultsPage.jsx";
import MemberProfilePage from "../features/profile/MemberProfilePage.jsx";
import ProfilePage from "../features/profile/ProfilePage.jsx";
import EditProfilePage from "../features/profile/EditProfilePage.jsx";

// Dev 3 — Requests & Engagement
import Requests from "../features/requests/Requests.jsx";
import Notifications from "../features/notifications/Notifications.jsx";
import Review from "../features/reviews/Review.jsx";

export default function AppRoutes() {
  return (
    <Routes>
      {/* --- Public --- */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* --- Member (protected) --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Dev 2 — Profile & Discovery */}
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <SearchPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search/results"
        element={
          <ProtectedRoute>
            <SearchResultsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/:id"
        element={
          <ProtectedRoute>
            <MemberProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Dev 3 — Requests & Engagement */}
      <Route
        path="/requests"
        element={
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/connections/:id/review"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />

      {/* Settings — Dev 1 */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* --- Admin --- */}
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <PlaceholderPage title="Admin — Reports" owner="Admin" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/skills"
        element={
          <AdminRoute>
            <PlaceholderPage title="Admin — Skill Library" owner="Admin" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <AdminRoute>
            <PlaceholderPage title="Admin — Review Moderation" owner="Admin" />
          </AdminRoute>
        }
      />

      {/* --- Error pages --- */}
      <Route path="/403" element={<ErrorPage code="403" />} />
      <Route path="*" element={<ErrorPage code="404" />} />
    </Routes>
  );
}
