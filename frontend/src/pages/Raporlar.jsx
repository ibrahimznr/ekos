import React, { useEffect, useState } from "react";
import RaporModal from "../components/RaporModal.jsx";
import ExcelImportModal from "../components/ExcelImportModal.jsx";

function Raporlar() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [kategori, setKategori] = useState("");
  const [periyot, setPeriyot] = useState("");
  const [uygunluk, setUygunluk] = useState("");
  const [kategoriler, setKategoriler] = useState([]);
  const [katMap, setKatMap] = useState({});
  const [openCreate, setOpenCreate] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  const [modalMode, setModalMode] = useState("create");
  const [selected, setSelected] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const decodePayload = () => {
    const t = localStorage.getItem("token");
    if (!t) return {};
    const parts = t.split(".");
    if (parts.length < 2) return {};
    try {
      const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
      return payload || {};
    } catch {
      return {};
    }
  };
  const role = decodePayload().role || "";
  const oidToDate = (oid) => {
    try { const ts = parseInt(String(oid).substring(0,8), 16); return new Date(ts*1000); } catch { return null; }
  };
  const formatDate = (v) => {
    if (!v) return "-";
    const d = typeof v === 'string' ? new Date(v) : v;
    if (!d || isNaN(d.getTime())) return "-";
    const pad = (n)=>String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const exportExcel = async () => {
    const res = await fetch("http://localhost:8000/export-excel", { headers });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ekos-raporlar.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const load = async () => {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    if (kategori) params.append("kategori_id", kategori);
    if (periyot) params.append("periyot", periyot);
    if (uygunluk) params.append("uygunluk", uygunluk);
    const urlParams = new URLSearchParams(window.location.search);
    const kidParam = urlParams.get('kategori_id');
    if (kidParam && !params.has('kategori_id')) params.append('kategori_id', kidParam);
    const pidParam = urlParams.get('project_id');
    if (pidParam && !params.has('project_id')) params.append('project_id', pidParam);
    const url = `http://localhost:8000/raporlar?${params.toString()}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    let arr = data.items || [];
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('expired') === '1') {
      const today = new Date();
      arr = arr.filter(x => x.gecerlilik_tarihi && new Date(x.gecerlilik_tarihi) < today);
    }
    const soon = searchParams.get('soon');
    if (soon) {
      const n = parseInt(soon, 10);
      if (!isNaN(n) && n > 0) {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(startOfDay.getTime() + n*24*60*60*1000);
        arr = arr.filter(x => {
          if (!x.gecerlilik_tarihi) return false;
          const dt = new Date(x.gecerlilik_tarihi);
          if (isNaN(dt.getTime())) return false;
          return dt >= startOfDay && dt <= end;
        });
      }
    }
    setItems(arr);
  };
  const loadCategories = async () => {
    const res = await fetch("http://localhost:8000/kategoriler", { headers });
    const data = await res.json();
    const arr = data.items || [];
    setKategoriler(arr);
    const m = {};
    for (const k of arr) m[k.id] = k.name;
    setKatMap(m);
  };
  useEffect(()=>{ load(); loadCategories(); }, []);
  useEffect(()=>{
    const sp = new URLSearchParams(window.location.search);
    if (sp.get('new') === '1') {
      setModalMode('create');
      setOpenCreate(true);
    }
  }, []);
  const openView = async (id) => {
    const res = await fetch(`http://localhost:8000/raporlar/${id}`, { headers });
    const data = await res.json();
    setSelected(data);
    setSelectedId(id);
    setModalMode("view");
    setOpenCreate(true);
  };
  const openEdit = async (id) => {
    const res = await fetch(`http://localhost:8000/raporlar/${id}`, { headers });
    const data = await res.json();
    setSelected(data);
    setSelectedId(id);
    setModalMode("edit");
    setOpenCreate(true);
  };
  const deleteItem = async (id) => {
    const res = await fetch(`http://localhost:8000/raporlar/${id}`, { method: "DELETE", headers });
    if (res.ok) load();
  };
  const formatUygunluk = (v) => {
    if (!v) return "-";
    const s = String(v).toLowerCase();
    if (s === "uygun") return "Uygun";
    if (s.includes("degil") || s.includes("değil") || s.includes("uygunsuz")) return "Uygun Değil";
    return v;
  };
  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h1 className="text-2xl font-semibold">Raporlar</h1>
          <p className="text-sm text-gray-600">{items.length} rapor bulundu</p>
        </div>
        {token && (
          <div className="flex gap-2">
            <button className="bg-ekos-primary text-white px-4 py-2 rounded" onClick={()=>setOpenCreate(true)}>+ Yeni Rapor</button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded" onClick={()=>window.location.href='/raporlar/import'}>Excel İçe Aktar</button>
            <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={exportExcel}>Excel İndir</button>
          </div>
        )}
      </div>

      <div className="mb-3">
        <div className="flex items-center gap-2 border rounded px-3 py-2 bg-white">
          <input className="flex-1 outline-none" placeholder="Rapor no, ekipman adı veya firma ara..." value={q} onChange={(e)=>setQ(e.target.value)} />
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={load}>Ara</button>
        </div>
      </div>

      <div className="border rounded p-4 mb-4 bg-white">
        <p className="text-sm font-medium mb-3">Filtreler</p>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Kategori</label>
            <select className="w-full border p-2 rounded" value={kategori} onChange={(e)=>setKategori(e.target.value)}>
              <option value="">Tüm kategoriler</option>
              {kategoriler.map(k => (
                <option key={k.id} value={k.id}>{k.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Periyot</label>
            <select className="w-full border p-2 rounded" value={periyot} onChange={(e)=>setPeriyot(e.target.value)}>
              <option value="">Tüm periyotlar</option>
              <option value="3">3 Ay</option>
              <option value="6">6 Ay</option>
              <option value="12">12 Ay</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Uygunluk</label>
            <select className="w-full border p-2 rounded" value={uygunluk} onChange={(e)=>setUygunluk(e.target.value)}>
              <option value="">Tüm durumlar</option>
              <option value="uygun">Uygun</option>
              <option value="uygun_degil">Uygun Değil</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {items.length === 0 && (
          <div className="bg-white border rounded-2xl p-6 text-center text-gray-500">Henüz rapor bulunmuyor</div>
        )}
        {items.map(x => {
          const uyg = String(x.uygunluk_durumu||"").toLowerCase();
          const isUygun = uyg === "uygun";
          return (
            <div key={x.id} className="bg-white border rounded-2xl shadow-sm p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-semibold">{x.ekipman_adi || "-"}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">{x.rapor_no}</span>
                    {x.olusturan_username && <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700">{x.olusturan_username}</span>}
                    {(x.project_name || x.project_id) && (
                      <span className="px-2 py-1 text-xs rounded bg-indigo-100 text-indigo-700">{x.project_name || x.project_id}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm ${isUygun ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{formatUygunluk(x.uygunluk_durumu)}</span>
                  <div className="flex flex-col gap-2">
                    <button className="px-3 py-1 border rounded" onClick={()=>openView(x.id)}>Görüntüle</button>
                    {(role === "inspector" || role === "admin") && (
                      <>
                        <button className="px-3 py-1 border rounded" onClick={()=>openEdit(x.id)}>Düzenle</button>
                        <button className="px-3 py-1 border rounded border-red-300 text-red-700" onClick={()=>deleteItem(x.id)}>Sil</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 mt-3">
                <div className="space-y-2">
                  <div><span className="text-xs text-gray-600">Kategori:</span> <span className="font-medium">{katMap[x.kategori_id] || "-"}</span></div>
                  <div><span className="text-xs text-gray-600">Periyot:</span> <span className="font-medium">{x.periyot ? `${x.periyot} Aylık` : '-'}</span></div>
                </div>
                <div className="space-y-2">
                  <div><span className="text-xs text-gray-600">Firma:</span> <span className="font-medium">{x.firma || "-"}</span></div>
                  <div><span className="text-xs text-gray-600">Geçerlilik:</span> <span className="font-medium">{x.gecerlilik_tarihi || "-"}</span></div>
                  <div><span className="text-xs text-gray-600">Lokasyon:</span> <span className="font-medium">{x.lokasyon || "-"}</span></div>
                  <div><span className="text-xs text-gray-600">Marka/Model:</span> <span className="font-medium">{x.marka_model || "-"}</span></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <RaporModal open={openCreate} onClose={()=>{ setOpenCreate(false); setSelected(null); setSelectedId(null); setModalMode("create"); load(); }} mode={modalMode} initial={selected} id={selectedId} />
      
    </div>
  );
}

export default Raporlar;
