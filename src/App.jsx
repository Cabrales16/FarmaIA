import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Home from "./Landing/Home";
import { Toaster } from "react-hot-toast";
import DashboardRouter from "./common/DashboardRouter";
import ProtectedRoute from "./Protected/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
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

      </Routes>
      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
