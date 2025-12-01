import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ProjectCreate() {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("aktif");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Proje adı zorunludur"); return; }
    setLoading(true);
    const res = await fetch("http://localhost:8000/projeler", { method: "POST", headers, body: JSON.stringify({ name }) });
    setLoading(false);
    if (res.ok) {
      navigate("/admin");
    } else {
      setError("Kaydetme sırasında hata oluştu");
    }
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Yeni Proje Oluştur</div>
          <div className="text-sm text-gray-600">Raporlar için yeni bir proje ekleyin</div>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Proje Adı *</label>
              <input className="w-full border rounded p-2" placeholder="Örn: Ankara Konut Projesi" value={name} onChange={(e)=>setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Proje Kodu *</label>
              <input className="w-full border rounded p-2" placeholder="Örn: PRJ-2025-001" value={code} onChange={(e)=>setCode(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Lokasyon</label>
            <input className="w-full border rounded p-2" placeholder="Proje lokasyonu" value={location} onChange={(e)=>setLocation(e.target.value)} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Başlangıç Tarihi</label>
              <input className="w-full border rounded p-2" type="date" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Bitiş Tarihi</label>
              <input className="w-full border rounded p-2" type="date" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Durum</label>
            <select className="w-full border rounded p-2" value={status} onChange={(e)=>setStatus(e.target.value)}>
              <option value="aktif">Aktif</option>
              <option value="askida">Askıda</option>
              <option value="tamamlandi">Tamamlandı</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Açıklama</label>
            <textarea className="w-full border rounded p-2" rows={4} placeholder="Proje hakkında detaylı açıklama" value={description} onChange={(e)=>setDescription(e.target.value)}></textarea>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" className="px-4 py-2 rounded border" onClick={()=>navigate('/admin')}>İptal</button>
            <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading? 'Kaydediliyor...' : 'Oluştur'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectCreate;
