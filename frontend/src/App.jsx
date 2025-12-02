import React, { useEffect, useState, useRef } from "react";
const API = ((import.meta.env.VITE_API_BASE_URL || "").replace(/^http:\/\//, "https://")).replace(/\/$/, "");
import { BrowserRouter, Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Raporlar from "./pages/Raporlar.jsx";
import AdminPanel from "./pages/AdminPanel.jsx";
import ProjectCreate from "./pages/ProjectCreate.jsx";
import CategoryCreate from "./pages/CategoryCreate.jsx";
import UserCreate from "./pages/UserCreate.jsx";
import Profile from "./pages/Profile.jsx";
import ExcelImport from "./pages/ExcelImport.jsx";

function Shell() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authed, setAuthed] = useState(!!localStorage.getItem("token"));
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [logoUrl, setLogoUrl] = useState("");
  const decodeUsername = () => {
    const t = localStorage.getItem("token");
    if (!t) return "";
    const parts = t.split(".");
    if (parts.length < 2) return "";
    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload?.sub || "";
    } catch {
      return "";
    }
  };
  useEffect(() => {
    const hasToken = !!localStorage.getItem("token");
    setAuthed(hasToken);
    setUsername(hasToken ? decodeUsername() : "");
    const loadMe = async () => {
      if (!hasToken) { setAvatarUrl(""); return; }
      try {
        const res = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        if (!res.ok) return;
        const d = await res.json();
        setAvatarUrl(d.avatar_url ? `${API}${d.avatar_url}` : "");
      } catch {}
    };
    loadMe();
    const processLogo = async () => {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = "/logo.png";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const { width, height } = canvas;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const sample = (x, y) => {
          const i = (y * width + x) * 4;
          return { r: data[i], g: data[i + 1], b: data[i + 2] };
        };
        const c1 = sample(0, 0);
        const c2 = sample(width - 1, 0);
        const c3 = sample(0, height - 1);
        const c4 = sample(width - 1, height - 1);
        const bg = {
          r: Math.round((c1.r + c2.r + c3.r + c4.r) / 4),
          g: Math.round((c1.g + c2.g + c3.g + c4.g) / 4),
          b: Math.round((c1.b + c2.b + c3.b + c4.b) / 4),
        };
        const thr = 24;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const dr = Math.abs(data[i] - bg.r);
            const dg = Math.abs(data[i + 1] - bg.g);
            const db = Math.abs(data[i + 2] - bg.b);
            if (dr < thr && dg < thr && db < thr) {
              data[i + 3] = 0;
            }
          }
        }
        ctx.putImageData(imgData, 0, 0);
        const url = canvas.toDataURL("image/png");
        setLogoUrl(url);
      } catch {}
    };
    processLogo();
  }, [location]);
  useEffect(() => {
    const handler = () => {
      const hasToken = !!localStorage.getItem("token");
      setAuthed(hasToken);
      setUsername(hasToken ? decodeUsername() : "");
      const loadMe = async () => {
        if (!hasToken) { setAvatarUrl(""); return; }
        try {
          const res = await fetch(`${API}/me`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
          if (!res.ok) return;
          const d = await res.json();
          setAvatarUrl(d.avatar_url ? `${API}${d.avatar_url}` : "");
        } catch {}
      };
      loadMe();
    };
    window.addEventListener("auth-update", handler);
    return () => window.removeEventListener("auth-update", handler);
  }, []);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);
  const logout = () => {
    localStorage.removeItem("token");
    setAuthed(false);
    setUsername("");
     setAvatarUrl("");
    navigate("/");
  };
  return (
    <div className="min-h-screen">
      {location.pathname !== "/" && (
        <header className="bg-gradient-to-b from-blue-500 to-indigo-600">
          <div className="max-w-6xl mx-auto flex items-center p-4 text-white">
            <div className="flex items-center gap-2 w-1/3">
              <img src={logoUrl || "/logo.png"} alt="EKOS" className="h-8" />
              <span className="font-semibold">EKOS</span>
            </div>
            <nav className="w-1/3 flex justify-center gap-4 text-sm">
              {authed && (
                <>
                  <Link to="/dashboard" className="hover:underline">Dashboard</Link>
                  <Link to="/raporlar" className="hover:underline">Raporlar</Link>
                  <Link to="/admin" className="hover:underline">Yönetim</Link>
                </>
              )}
            </nav>
            <div className="w-1/3 flex justify-end relative" ref={menuRef}>
              {authed && (
                <>
                  <button
                    className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/70 flex items-center justify-center bg-white/10"
                    onClick={() => setMenuOpen((v) => !v)}
                    aria-label="Hesap menüsü"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-semibold">
                        {username ? username[0].toUpperCase() : "U"}
                      </span>
                    )}
                  </button>
                  {menuOpen && (
                    <div className="absolute top-12 right-0 bg-white text-gray-900 rounded-md shadow-lg border min-w-[160px]">
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => { setMenuOpen(false); navigate("/profil"); }}
                      >
                        Profil
                      </button>
                      <button
                        className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        onClick={() => { setMenuOpen(false); logout(); }}
                      >
                        Çıkış
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/raporlar" element={<Raporlar />} />
          <Route path="/raporlar/import" element={<ExcelImport />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/proje-olustur" element={<ProjectCreate />} />
          <Route path="/admin/kategori-olustur" element={<CategoryCreate />} />
          <Route path="/admin/kullanici-olustur" element={<UserCreate />} />
          <Route path="/profil" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Shell />
    </BrowserRouter>
  );
}

export default App;
