import React, { useEffect, useState } from "react";

function AdminPanel() {
  const [name, setName] = useState("");
  const [items, setItems] = useState([]);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const load = async () => {
    const res = await fetch("http://localhost:8000/kategoriler", { headers });
    const data = await res.json();
    setItems(data.items || []);
  };
  useEffect(()=>{ load(); }, []);
  const create = async () => {
    await fetch("http://localhost:8000/kategoriler", { method: "POST", headers, body: JSON.stringify({ name }) });
    setName("");
    load();
  };
  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold mb-3">Kategori Yönetimi</h1>
      <div className="flex gap-2 mb-4">
        <input className="border p-2 flex-1" placeholder="Kategori adı" value={name} onChange={(e)=>setName(e.target.value)} />
        <button onClick={create} className="bg-ekos-primary text-white px-4">Ekle</button>
      </div>
      <ul className="space-y-1">
        {items.map(c => (<li key={c.id} className="border p-2">{c.name}</li>))}
      </ul>
    </div>
  );
}

export default AdminPanel;
