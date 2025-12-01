import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, uygun: 0, uygunDegil: 0, soon30: 0, soon7: 0 });
  const [katMap, setKatMap] = useState({});
  const [adminCategories, setAdminCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [printNow, setPrintNow] = useState(null);
  const [firmDist, setFirmDist] = useState({ slices: [], total: 0 });
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    Promise.all([
      fetch("http://localhost:8000/raporlar", { headers }).then(r=>r.json()),
      fetch("http://localhost:8000/kategoriler", { headers }).then(r=>r.json()),
      fetch("http://localhost:8000/projeler", { headers }).then(r=>r.json()).catch(()=>({items:[]})),
    ]).then(([raporData, katData, projData]) => {
      const items = raporData.items || [];
      const cats = katData.items || [];
      const km = {};
      for (const k of cats) km[k.id] = k.name;
      setKatMap(km);
      setAdminCategories(cats);
      const now = new Date();
      const month = now.getMonth();
      const year = now.getFullYear();
      const total = items.length;
      const thisMonth = items.filter(x => {
        const oidTime = parseInt(x.id.substring(0,8), 16);
        const dt = new Date(oidTime*1000);
        return dt.getMonth() === month && dt.getFullYear() === year;
      }).length;
      const uygun = items.filter(x => String(x.uygunluk_durumu).toLowerCase() === "uygun").length;
      const uygunDegil = items.filter(x => {
        const s = String(x.uygunluk_durumu||"").toLowerCase();
        return s.includes("degil") || s.includes("değil") || s.includes("uygunsuz");
      }).length;
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const inDays = d => new Date(startOfDay.getTime() + d*24*60*60*1000);
      const parseDate = (v) => {
        if (!v) return null;
        const s = String(v).trim();
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
        if (/^\d{2}\.\d{2}\.\d{4}$/.test(s)) {
          const [dd,mm,yyyy] = s.split('.');
          return new Date(parseInt(yyyy,10), parseInt(mm,10)-1, parseInt(dd,10));
        }
        const d = new Date(s);
        return isNaN(d.getTime()) ? null : d;
      };
      let expired = 0, soon30 = 0, soon7 = 0;
      for (const x of items) {
        const dt = parseDate(x.gecerlilik_tarihi);
        if (!dt) continue;
        if (dt < startOfDay) expired++;
        else if (dt <= inDays(7)) soon7++;
        else if (dt <= inDays(30)) soon30++;
      }
      setStats({ total, thisMonth, uygun, uygunDegil, soon30, soon7, expired });
      const countsById = {};
      for (const it of items) countsById[it.kategori_id] = (countsById[it.kategori_id]||0)+1;
      const arr = cats.map(c => ({ id: c.id, name: c.name, count: countsById[c.id]||0 }))
                      .sort((a,b)=>b.count-a.count)
                      .slice(0,8);
      setCategoryCounts(arr);
      const pitems = (projData.items||[]).map(p => {
        const oidTime = parseInt(p.id.substring(0,8), 16);
        const dt = new Date(oidTime*1000);
        return { ...p, createdAt: dt };
      });
      setProjects(pitems);
      const firmCounts = {};
      for (const it of items) {
        const f = String(it.firma || '').trim();
        if (!f) continue;
        firmCounts[f] = (firmCounts[f] || 0) + 1;
      }
      let arrF = Object.entries(firmCounts).map(([name, count]) => ({ name, count })).sort((a,b)=>b.count-a.count);
      const totalF = arrF.reduce((s,x)=>s+x.count,0);
      let topF = arrF.slice(0,6);
      if (arrF.length > 6) {
        const other = arrF.slice(6).reduce((s,x)=>s+x.count,0);
        topF = [...topF, { name: 'Diğer', count: other }];
      }
      setFirmDist({ slices: topF, total: totalF });
    });
  }, []);
  const uygunPct = stats.uygun + stats.uygunDegil > 0 ? Math.round((stats.uygun/(stats.uygun+stats.uygunDegil))*100) : 0;
  const downloadPdf = () => {
    const dt = new Date();
    setPrintNow(dt);
    const prevTitle = document.title;
    document.title = "EKOS-Dashboard-Raporu";
    setTimeout(() => {
      window.print();
      setTimeout(() => { document.title = prevTitle; }, 500);
    }, 100);
  };
  return (
    <div className="space-y-6">
      {/* Print header/footer */}
      <div className="hidden print:block fixed top-0 left-0 right-0 bg-white text-xs px-6 py-2 border-b">
        <div className="flex justify-between">
          <span>Dosya: EKOS-Dashboard-Raporu.pdf</span>
          <span>Oluşturulma: {printNow ? printNow.toLocaleString('tr-TR') : new Date().toLocaleString('tr-TR')}</span>
        </div>
      </div>
      <div className="hidden print:block fixed bottom-0 left-0 right-0 bg-white text-xs px-6 py-2 border-t">
        <div className="flex justify-between">
          <span>Dosya: EKOS-Dashboard-Raporu.pdf</span>
          <span>Oluşturulma: {printNow ? printNow.toLocaleString('tr-TR') : new Date().toLocaleString('tr-TR')}</span>
        </div>
      </div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">Ekipman muayene raporlarınızın genel görünümü</p>
        </div>
        <div>
          <button className="px-4 py-2 rounded bg-ekos-primary text-white" onClick={()=>navigate('/raporlar?new=1')}>+ Yeni Rapor</button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-sm text-gray-600">Toplam Rapor</div>
          <div className="text-3xl font-semibold">{stats.total}</div>
          <div className="text-xs text-gray-500">Sistemdeki tüm raporlar</div>
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-sm text-gray-600">Bu Ay</div>
          <div className="text-3xl font-semibold">{stats.thisMonth}</div>
          <div className="text-xs text-gray-500">Oluşturulan rapor sayısı</div>
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-sm text-gray-600">Uygun</div>
          <div className="text-3xl font-semibold text-emerald-700">{stats.uygun}</div>
          <div className="text-xs text-emerald-700">%{uygunPct} uygunluk oranı</div>
        </div>
        <div className="p-4 bg-white border rounded-xl shadow-sm">
          <div className="text-sm text-gray-600">Uygun Değil</div>
          <div className="text-3xl font-semibold text-red-700">{stats.uygunDegil}</div>
          <div className="text-xs text-red-700">Dikkat gerekiyor</div>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-xl shadow-sm">
          <div className="p-4 font-medium">Geçerlilik Uyarıları</div>
          <div className="p-4 pt-0 space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 cursor-pointer" onClick={()=>navigate('/raporlar?expired=1')}>
              <div>
                <div className="text-sm font-medium">Süresi Dolan</div>
                <div className="text-xs text-gray-600">Geçerlilik tarihi geçmiş raporlar</div>
              </div>
              <div className="text-xl font-semibold text-red-600">{stats.expired || 0}</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-yellow-50 border border-yellow-200 cursor-pointer" onClick={()=>navigate('/raporlar?soon=30')}>
              <div>
                <div className="text-sm font-medium">30 Gün İçinde</div>
                <div className="text-xs text-gray-600">Geçerliliği bitecek raporlar</div>
              </div>
              <div className="text-xl font-semibold text-yellow-600">{stats.soon30}</div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-red-50 border border-red-200 cursor-pointer" onClick={()=>navigate('/raporlar?soon=7')}>
              <div>
                <div className="text-sm font-medium">7 Gün İçinde</div>
                <div className="text-xs text-gray-600">Acil dikkat gerekiyor</div>
              </div>
              <div className="text-xl font-semibold text-red-600">{stats.soon7}</div>
            </div>
          </div>
        </div>
        <div className="bg-white border rounded-xl shadow-sm">
          <div className="p-4 font-medium">Kategori Dağılımı</div>
          <div className="p-4 pt-0 space-y-3">
            {categoryCounts.map(({id,name,count}) => {
              const pct = stats.total > 0 ? Math.round((count/stats.total)*100) : 0;
              return (
                <div key={id} onClick={()=>navigate(`/raporlar?kategori_id=${id}`)} className="cursor-pointer">
                  <div className="flex justify-between text-sm">
                    <span>{name}</span>
                    <span className="text-gray-600">{count} (%{pct})</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded">
                    <div className="h-2 bg-blue-600 rounded" style={{width: `${pct}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 font-medium">Projeler</div>
        <div className="p-4 pt-0 space-y-3">
          {projects.map(p => (
            <div key={p.id} className="p-4 rounded-lg bg-indigo-50 border border-indigo-100 cursor-pointer" onClick={()=>navigate(`/raporlar?project_id=${p.id}`)}>
              <div className="font-semibold">{p.name}</div>
              <div className="text-sm text-gray-600">Varsayılan proje</div>
              <div className="text-xs text-gray-500 mt-1">{p.createdAt.toLocaleDateString('tr-TR')}</div>
            </div>
          ))}
          {projects.length === 0 && (
            <div className="p-4 rounded-lg bg-gray-50 border">Henüz proje bulunmuyor</div>
          )}
        </div>
      </div>
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 font-medium">Hızlı İşlemler</div>
        <div className="p-4 pt-0 flex gap-3">
          <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={()=>navigate('/raporlar')}>Tüm Raporları Görüntüle</button>
          <button className="px-4 py-2 rounded border border-orange-300 text-orange-700" onClick={()=>navigate('/raporlar?expired=1')}>Süresi Dolanlar</button>
          <button className="px-4 py-2 rounded bg-emerald-600 text-white" onClick={downloadPdf}>Dashboard PDF İndir</button>
        </div>
      </div>
      <div className="bg-white border rounded-xl shadow-sm">
        <div className="p-4 font-medium">Firma Dağılımı</div>
        <div className="p-4 pt-0 grid md:grid-cols-2 gap-6 items-center">
          <div className="flex justify-center">
            {firmDist.total > 0 ? (
              (() => {
                const size = 240;
                const cx = size/2;
                const cy = size/2;
                const r = size/2 - 20;
                const colors = ["#60a5fa","#34d399","#f472b6","#f59e0b","#f87171","#8b5cf6","#64748b"]; 
                let start = 0;
                const segments = [];
                firmDist.slices.forEach((s, i) => {
                  const angle = (s.count/firmDist.total) * Math.PI * 2;
                  const end = start + angle;
                  const x1 = cx + r * Math.cos(start);
                  const y1 = cy + r * Math.sin(start);
                  const x2 = cx + r * Math.cos(end);
                  const y2 = cy + r * Math.sin(end);
                  const large = angle > Math.PI ? 1 : 0;
                  const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
                  segments.push({ d, fill: colors[i % colors.length], name: s.name });
                  start = end;
                });
                return (
                  <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                    {segments.map((seg, idx) => (
                      <path key={idx} d={seg.d} fill={seg.fill} className="cursor-pointer" onClick={()=>navigate(`/raporlar?q=${encodeURIComponent(seg.name)}`)}>
                        <title>{seg.name}</title>
                      </path>
                    ))}
                  </svg>
                );
              })()
            ) : (
              <div className="text-sm text-gray-600">Veri yok</div>
            )}
          </div>
          <div className="space-y-2">
            {firmDist.slices.map((s, i) => {
              const pct = stats.total > 0 ? Math.round((s.count/firmDist.total)*100) : 0;
              const color = ["#60a5fa","#34d399","#f472b6","#f59e0b","#f87171","#8b5cf6","#64748b"][i % 7];
              return (
                <div key={s.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded" style={{backgroundColor: color}}></span>
                    <span>{s.name}</span>
                  </div>
                  <div className="text-gray-600">{s.count} (%{pct})</div>
                </div>
              );
            })}
            {firmDist.total > 0 && (
              <div className="text-xs text-gray-500">Toplam: {firmDist.total}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
