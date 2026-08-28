import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.jsx";
import AdminRoute from "./AdminRoute.jsx";

import Landing from "../pages/Landing.jsx";
import Dashboard from "../pages/Dashboard.jsx";
import ErrorPage from "../pages/ErrorPage.jsx";
import Login from "../features/auth/Login.jsx";
import Register from "../features/auth/Register.jsx";

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
import Settings from "../features/settings/Settings.jsx";
import AdminReports from "../features/admin/AdminReports.jsx";
import AdminSkillLibrary from "../features/admin/AdminSkillLibrary.jsx";
import AdminReviewModeration from "../features/admin/AdminReviewModeration.jsx";
import VisionFeed from "../features/vision/VisionFeed.jsx";
import VisionChat from "../features/vision/VisionChat.jsx";
import VisionUpgrade from "../features/vision/VisionUpgrade.jsx";

/**
 * Full route table for the app. Every route exists from day one, even
 * screens owned by Dev 2 / Dev 3, so the app is navigable immediately.
 
 * To wire in a real screen: import it above and swap the <PlaceholderPage />
 * element for it below. Nothing else in this file needs to change.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* --- Public --- */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/*  Member (protected)  */}
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

      {/*Admin */}
      <Route
        path="/admin/reports"
        element={
          <AdminRoute>
            <AdminReports />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/skills"
        element={
          <AdminRoute>
            <AdminSkillLibrary />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <AdminRoute>
            <AdminReviewModeration />
          </AdminRoute>
        }
      />

      {/* VISION PROTOTYPE (demo only, not real functionality)  */}
      <Route path="/vision/feed" element={<VisionFeed />} />
      <Route path="/vision/chat/:memberId" element={<VisionChat />} />
      <Route path="/vision/upgrade" element={<VisionUpgrade />} />

      {/* Error pages  */}
      <Route path="/403" element={<ErrorPage code="403" />} />
      <Route path="*" element={<ErrorPage code="404" />} />
    </Routes>
  );
}
