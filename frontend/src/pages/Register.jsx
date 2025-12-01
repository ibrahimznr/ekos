import React, { useState } from "react";
import { Link } from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [token, setToken] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch("http://localhost:8000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, password_confirm: password2 })
    });
    const data = await res.json();
    if (res.ok) setToken(data.verification_token || "");
  };
  const verify = async () => {
    const res = await fetch("http://localhost:8000/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, token })
    });
    await res.json();
  };
  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-b from-blue-500 to-indigo-600 flex flex-col items-center justify-center p-6">
      <div className="text-center text-white mb-6">
        <div className="text-2xl">Yeni hesap oluştur</div>
      </div>
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <div className="text-xl font-semibold mb-1">Kayıt Ol</div>
        <div className="text-sm text-gray-600 mb-4">Yeni bir hesap oluşturmak için bilgilerinizi girin</div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-600">Kullanıcı Adı</label>
            <input className="w-full border p-2 rounded mt-1" placeholder="kullaniciadi" value={username} onChange={(e)=>setUsername(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Email</label>
            <input className="w-full border p-2 rounded mt-1" placeholder="ornek@email.com" value={email} onChange={(e)=>setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-gray-600">Şifre</label>
            <input className="w-full border p-2 rounded mt-1" type="password" placeholder="********" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <div className="text-xs text-gray-500 mt-1">En az 6 karakter olmalıdır</div>
          </div>
          <div>
            <label className="text-xs text-gray-600">Şifre Tekrar</label>
            <input className="w-full border p-2 rounded mt-1" type="password" placeholder="********" value={password2} onChange={(e)=>setPassword2(e.target.value)} />
          </div>
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded shadow">Kayıt Ol</button>
        </form>
        <div className="text-center text-sm text-gray-600 mt-4">Zaten hesabınız var mı?</div>
        <Link to="/" className="block text-center mt-2 border border-blue-300 text-blue-700 hover:bg-blue-50 rounded p-2">← Giriş Yap</Link>
        <div className="mt-6 space-y-2">
          <div className="text-sm text-gray-600">E-posta doğrulaması için token:</div>
          <input className="w-full border p-2 rounded" placeholder="Doğrulama Token" value={token} onChange={(e)=>setToken(e.target.value)} />
          <button type="button" onClick={verify} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded">E-postayı Doğrula</button>
        </div>
      </div>
    </div>
  );
}

export default Register;
