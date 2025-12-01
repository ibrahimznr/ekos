import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Raporlar from "./pages/Raporlar";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <header className="border-b">
          <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="EKOS" className="h-8" />
              <span className="text-ekos-primary font-semibold">EKOS</span>
            </div>
            <nav className="flex gap-4 text-sm">
              <Link to="/">Giriş</Link>
              <Link to="/register">Kayıt</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/raporlar">Raporlar</Link>
              <Link to="/admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/raporlar" element={<Raporlar />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
