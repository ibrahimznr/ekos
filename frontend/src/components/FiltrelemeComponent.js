import React from "react";

function FiltrelemeComponent({ q, setQ, kategori, setKategori, periyot, setPeriyot, uygunluk, setUygunluk, onFilter }) {
  return (
    <div className="grid md:grid-cols-5 gap-2">
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
      <button className="bg-ekos-primary text-white" onClick={onFilter}>Filtrele</button>
    </div>
  );
}

export default FiltrelemeComponent;
