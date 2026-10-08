import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Home from "./Landing/Home";
import { Toaster } from "react-hot-toast";
import DashboardRouter from "./common/DashboardRouter";
import ProtectedRoute from "./Protected/ProtectedRoute";
import { isDemo } from "./api/supabase";
import DemoBanner from "./mock/DemoBanner";

// GitHub Pages no sabe redirigir rutas del SPA: en la demo se usa HashRouter (#/ruta).
const Router = isDemo ? HashRouter : BrowserRouter;

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />

        <Route
          path="/inicio/*"
          element={
            <ProtectedRoute allowedRoles={[1, 3]}>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <Toaster position="top-right" />
      {isDemo && <DemoBanner />}
    </Router>
  );
}

export default App;
