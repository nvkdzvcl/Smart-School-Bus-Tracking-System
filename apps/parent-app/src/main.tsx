import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RootLayout from "../app/layout/layout.tsx";
import "../app/globals.css";

// Pages
import Home from "../app/home/Home";
import Login from "../app/login/Login";
import History from "../app/unecessary/History.tsx";
import Messages from "../app/messages/Messages";
import Profile from "../app/profile/Profile";
import Schedule from "../app/schedule/Schedule";
import Tracking from "../app/tracking/Tracking";
import Settings from "../app/settings/Settings.tsx";
import { PrivateRoute } from "@/components/PrivateRoute.tsx";


ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <BrowserRouter>
    <Routes>
      {/* Public route */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <RootLayout>
              <Home />
            </RootLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/history"
        element={
          <PrivateRoute>
            <RootLayout>
              <History />
            </RootLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <RootLayout>
              <Profile />
            </RootLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/schedule"
        element={
          <PrivateRoute>
            <RootLayout>
              <Schedule />
            </RootLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <PrivateRoute>
            <RootLayout>
              <Messages />
            </RootLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tracking"
        element={
          <PrivateRoute>
            <RootLayout>
              <Tracking />
            </RootLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <RootLayout>
              <Settings />
            </RootLayout>
          </PrivateRoute>
        }
      />
    </Routes>
  </BrowserRouter>
);
