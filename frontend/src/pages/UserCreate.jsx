import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserCreate() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState("viewer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !email.trim() || !password) { setError("Zorunlu alanlar eksik"); return; }
    if (password !== password2) { setError("Şifreler uyuşmuyor"); return; }
    setLoading(true);
    const res = await fetch("http://localhost:8000/users", { method: "POST", headers, body: JSON.stringify({ username, email, password, role }) });
    setLoading(false);
    if (res.ok) navigate("/admin");
    else setError("Kullanıcı oluşturulamadı");
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Yeni Kullanıcı Oluştur</div>
          <div className="text-sm text-gray-600">Sisteme yeni bir kullanıcı ekleyin</div>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Kullanıcı Adı</label>
            <input className="w-full border rounded p-2" placeholder="kullaniciadi" value={username} onChange={(e)=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <input className="w-full border rounded p-2" placeholder="kullanici@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Şifre</label>
              <input className="w-full border rounded p-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Şifre Tekrar</label>
              <input className="w-full border rounded p-2" type="password" value={password2} onChange={(e)=>setPassword2(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Rol</label>
            <select className="w-full border rounded p-2" value={role} onChange={(e)=>setRole(e.target.value)}>
              <option value="viewer">Görüntüleyici</option>
              <option value="inspector">Müfettiş</option>
              <option value="admin">Yönetici</option>
            </select>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded border" onClick={()=>navigate('/admin')}>İptal</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading? 'Kaydediliyor...' : 'Oluştur'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserCreate;
