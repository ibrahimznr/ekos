import React, { useEffect, useState } from "react";
const API = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
import { useNavigate, Link } from "react-router-dom";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [bgUrl, setBgUrl] = useState("");
  const navigate = useNavigate();
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!identifier || !password) {
      setError("Kullanıcı adı/e-posta ve şifre gerekli");
      return;
    }
    setLoading(true);
    try {
      const body = new URLSearchParams();
      body.append("username", identifier);
      body.append("password", password);
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        localStorage.setItem("token", data.access_token);
        window.dispatchEvent(new Event("auth-update"));
        navigate("/dashboard");
      } else {
        setError(data.detail || "Giriş başarısız");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const processLogo = async () => {
      try {
        const img = new Image();
        img.src = "/logo.png";
        await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const { width, height } = canvas;
        const imgData = ctx.getImageData(0, 0, width, height);
        const data = imgData.data;
        const sample = (x, y) => { const i = (y * width + x) * 4; return { r: data[i], g: data[i + 1], b: data[i + 2] }; };
        const c1 = sample(0, 0), c2 = sample(width - 1, 0), c3 = sample(0, height - 1), c4 = sample(width - 1, height - 1);
        const bg = { r: Math.round((c1.r + c2.r + c3.r + c4.r) / 4), g: Math.round((c1.g + c2.g + c3.g + c4.g) / 4), b: Math.round((c1.b + c2.b + c3.b + c4.b) / 4) };
        const isWhite = bg.r > 230 && bg.g > 230 && bg.b > 230;
        const thr = isWhite ? 60 : 28;
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const dr = data[i] - bg.r, dg = data[i + 1] - bg.g, db = data[i + 2] - bg.b;
            const dist = Math.sqrt(dr*dr + dg*dg + db*db);
            if (dist < thr) data[i + 3] = 0;
          }
        }
        ctx.putImageData(imgData, 0, 0);
        setLogoUrl(canvas.toDataURL("image/png"));
      } catch {}
    };
    processLogo();
    const resolveBg = async () => {
      const candidates = [
        "/login-bg.jpg",
        "/login-bg.jpeg",
        "/login-bg.png",
        "/login-bg.webp",
        "/login-bg.JPG",
        "/login-bg.JPEG",
        "/login-bg.PNG",
        "/login-bg.WEBP",
      ];
      for (const u of candidates) {
        try {
          const img = new Image();
          img.src = u;
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
          setBgUrl(u);
          return;
        } catch {}
      }
      setBgUrl("");
    };
    resolveBg();
  }, []);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-center bg-cover" style={{ backgroundImage: bgUrl ? `url(${bgUrl})` : undefined, backgroundColor: "#ffffff" }}>
      <div className="mb-6">
        <img src={logoUrl || "/logo.png"} alt="EKOS" className="h-72 md:h-96" />
      </div>
      <div className="w-full max-w-md bg-gradient-to-b from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl p-6">
        <div className="text-xl font-semibold mb-1">Giriş Yap</div>
        <div className="text-sm opacity-90 mb-4">Hesabınıza erişmek için bilgilerinizi girin</div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-white/80">Email</label>
            <input className="w-full border p-2 rounded mt-1 bg-white text-gray-900" placeholder="ornek@email.com" value={identifier} onChange={(e)=>setIdentifier(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-white/80">Şifre</label>
            <input className="w-full border p-2 rounded mt-1 bg-white text-gray-900" type="password" placeholder="********" value={password} onChange={(e)=>setPassword(e.target.value)} />
          </div>
          {error && <div className="text-red-200 text-sm">{error}</div>}
          <button type="submit" className="w-full bg-white text-blue-700 hover:bg-blue-50 p-3 rounded shadow disabled:opacity-60" disabled={loading}>
            {loading ? "Gönderiliyor..." : "Giriş Yap"}
          </button>
        </form>
        <div className="text-center text-sm opacity-90 mt-4">Hesabınız yok mu?</div>
        <Link to="/register" className="block text-center mt-2 border border-white/60 text-white hover:bg-white/10 rounded p-2">Kayıt Ol</Link>
      </div>
      <div className="text-gray-500 text-xs mt-6">© 2025 EKOS - Ekipman Kontrol Otomasyon Sistemi. Tüm hakları saklıdır.</div>
    </div>
  );
}

export default Login;
