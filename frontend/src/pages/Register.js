import React, { useState } from "react";

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
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Kayıt</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2" placeholder="Kullanıcı adı" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input className="w-full border p-2" placeholder="E-posta" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <input className="w-full border p-2" type="password" placeholder="Şifre" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <input className="w-full border p-2" type="password" placeholder="Şifre tekrarı" value={password2} onChange={(e)=>setPassword2(e.target.value)} />
        <button className="w-full bg-ekos-primary text-white p-2">Kayıt Ol</button>
      </form>
      <div className="mt-4 space-y-2">
        <input className="w-full border p-2" placeholder="Doğrulama Token" value={token} onChange={(e)=>setToken(e.target.value)} />
        <button onClick={verify} className="w-full bg-emerald-600 text-white p-2">E-postayı Doğrula</button>
      </div>
    </div>
  );
}

export default Register;
