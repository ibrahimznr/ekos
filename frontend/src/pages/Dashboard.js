import React, { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, uygun: 0, uygunDegil: 0, uyari: 0 });
  const [kategoriler, setKategoriler] = useState([]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    fetch("http://localhost:8000/raporlar", { headers })
      .then(r => r.json())
      .then(d => {
        const items = d.items || [];
        const now = new Date();
        const month = now.getMonth();
        const year = now.getFullYear();
        const total = items.length;
        const thisMonth = items.filter(x => {
          const oidTime = parseInt(x.id.substring(0,8), 16);
          const dt = new Date(oidTime*1000);
          return dt.getMonth() === month && dt.getFullYear() === year;
        }).length;
        const uygun = items.filter(x => x.uygunluk_durumu === "uygun").length;
        const uygunDegil = items.filter(x => x.uygunluk_durumu === "uygun_degil").length;
        const today = new Date();
        const uyari = items.filter(x => {
          if (!x.gecerlilik_tarihi) return false;
          const dt = new Date(x.gecerlilik_tarihi);
          return dt < today;
        }).length;
        setStats({ total, thisMonth, uygun, uygunDegil, uyari });
      });
    fetch("http://localhost:8000/kategoriler", { headers })
      .then(r => r.json())
      .then(d => {
        const unique = new Map();
        (d.items||[]).forEach(c => unique.set(c.name.trim().toLowerCase(), c));
        setKategoriler(Array.from(unique.values()));
      });
  }, []);
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <div className="p-4 border rounded">
        <div className="text-sm">Toplam Rapor</div>
        <div className="text-2xl font-semibold">{stats.total}</div>
      </div>
      <div className="p-4 border rounded">
        <div className="text-sm">Bu Ay Oluşturulan</div>
        <div className="text-2xl font-semibold">{stats.thisMonth}</div>
      </div>
      <div className="p-4 border rounded">
        <div className="text-sm">Uygun/Uygun Değil</div>
        <div className="text-2xl font-semibold">{stats.uygun}/{stats.uygunDegil}</div>
      </div>
      <div className="p-4 border rounded">
        <div className="text-sm">Geçerlilik Uyarıları</div>
        <div className="text-2xl font-semibold">{stats.uyari}</div>
      </div>
      <div className="md:col-span-3 p-4 border rounded">
        <div className="font-medium mb-2">Kategori Dağılımı</div>
        <div className="flex flex-wrap gap-2">
          {kategoriler.map(k => (
            <span key={k.id} className="px-2 py-1 bg-ekos-accent text-white rounded text-sm">{k.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
