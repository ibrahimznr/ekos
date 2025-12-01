import React, { useState } from "react";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    const body = new URLSearchParams();
    body.append("username", identifier);
    body.append("password", password);
    const res = await fetch("http://localhost:8000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const data = await res.json();
    if (res.ok) localStorage.setItem("token", data.access_token);
  };
  return (
    <div className="max-w-md mx-auto">
      <div className="flex flex-col items-center gap-2 mb-6">
        <img src="/logo.png" alt="EKOS" className="h-16" />
        <h1 className="text-xl font-semibold">Giriş</h1>
      </div>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full border p-2" placeholder="Kullanıcı adı/E-posta" value={identifier} onChange={(e)=>setIdentifier(e.target.value)} />
        <input className="w-full border p-2" type="password" placeholder="Şifre" value={password} onChange={(e)=>setPassword(e.target.value)} />
        <button className="w-full bg-ekos-primary text-white p-2">Giriş Yap</button>
      </form>
    </div>
  );
}

export default Login;
