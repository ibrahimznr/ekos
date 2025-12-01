import React, { useEffect, useState } from "react";

function Raporlar() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("");
  const [periyot, setPeriyot] = useState("");
  const [uygunluk, setUygunluk] = useState("");
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (kategori) params.append("kategori_id", kategori);
    if (periyot) params.append("periyot", periyot);
    if (uygunluk) params.append("uygunluk", uygunluk);
    const url = `http://localhost:8000/raporlar?${params.toString()}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    setItems(data.items || []);
  };
  useEffect(()=>{ load(); }, []);
  return (
    <div>
      <div className="grid md:grid-cols-4 gap-2 mb-3">
        <input className="border p-2" placeholder="Rapor no/ekipman/firma" value={q} onChange={(e)=>setQ(e.target.value)} />
        <input className="border p-2" placeholder="Kategori ID" value={kategori} onChange={(e)=>setKategori(e.target.value)} />
        <select className="border p-2" value={periyot} onChange={(e)=>setPeriyot(e.target.value)}>
          <option value="">Periyot</option>
          <option value="3">3 Ay</option>
          <option value="6">6 Ay</option>
          <option value="12">12 Ay</option>
        </select>
        <select className="border p-2" value={uygunluk} onChange={(e)=>setUygunluk(e.target.value)}>
          <option value="">Uygunluk</option>
          <option value="uygun">Uygun</option>
          <option value="uygun_degil">Uygun Değil</option>
        </select>
      </div>
      <button className="bg-ekos-primary text-white px-4 py-2" onClick={load}>Filtrele</button>
      <div className="mt-4 border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Rapor No</th>
              <th className="p-2 text-left">Ekipman</th>
              <th className="p-2 text-left">Firma</th>
              <th className="p-2 text-left">Uygunluk</th>
            </tr>
          </thead>
          <tbody>
            {items.map(x => (
              <tr key={x.id} className="border-t">
                <td className="p-2">{x.rapor_no}</td>
                <td className="p-2">{x.ekipman_adi}</td>
                <td className="p-2">{x.firma}</td>
                <td className="p-2">{x.uygunluk_durumu || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Raporlar;
