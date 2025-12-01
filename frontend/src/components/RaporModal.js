import React, { useState } from "react";

function RaporModal({ open, onClose }) {
  const [ekipman_adi, setEkipman] = useState("");
  const [kategori_id, setKategori] = useState("");
  const [firma, setFirma] = useState("");
  const token = localStorage.getItem("token");
  const save = async () => {
    const res = await fetch("http://localhost:8000/raporlar", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ekipman_adi, kategori_id, firma })
    });
    if (res.ok) onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-full max-w-md space-y-2">
        <div className="font-medium">Yeni Rapor</div>
        <input className="border p-2 w-full" placeholder="Ekipman adı" value={ekipman_adi} onChange={(e)=>setEkipman(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Kategori ID" value={kategori_id} onChange={(e)=>setKategori(e.target.value)} />
        <input className="border p-2 w-full" placeholder="Firma" value={firma} onChange={(e)=>setFirma(e.target.value)} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2">İptal</button>
          <button onClick={save} className="bg-ekos-primary text-white px-3 py-2">Kaydet</button>
        </div>
      </div>
    </div>
  );
}

export default RaporModal;
