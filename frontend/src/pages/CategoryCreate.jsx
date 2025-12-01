import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CategoryCreate() {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [subInput, setSubInput] = useState("");
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
  const addSub = () => {
    const v = subInput.trim();
    if (!v) return;
    setSubs(prev => [...prev, v]);
    setSubInput("");
  };
  const removeSub = (idx) => {
    setSubs(prev => prev.filter((_, i) => i !== idx));
  };
  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Kategori adı zorunludur"); return; }
    setLoading(true);
    const res = await fetch("http://localhost:8000/kategoriler", { method: "POST", headers, body: JSON.stringify({ name }) });
    if (!res.ok) { setLoading(false); setError("Kategori oluşturulamadı"); return; }
    const data = await res.json();
    const parentId = data.id;
    for (const s of subs) {
      await fetch("http://localhost:8000/kategoriler", { method: "POST", headers, body: JSON.stringify({ name: s, parent: parentId }) });
    }
    setLoading(false);
    navigate("/admin");
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Yeni Kategori Oluştur</div>
          <div className="text-sm text-gray-600">Raporlar için yeni bir kategori ekleyin</div>
        </div>
        <form onSubmit={submit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Kategori Adı *</label>
            <input className="w-full border rounded p-2" placeholder="Örn: Vinç" value={name} onChange={(e)=>setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Açıklama (Opsiyonel)</label>
            <input className="w-full border rounded p-2" placeholder="Kategori açıklaması" value={desc} onChange={(e)=>setDesc(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Alt Kategoriler (Opsiyonel)</label>
            <div className="flex gap-2">
              <input className="w-full border rounded p-2" placeholder="Alt kategori girin" value={subInput} onChange={(e)=>setSubInput(e.target.value)} />
              <button type="button" className="px-4 py-2 rounded bg-blue-600 text-white" onClick={addSub}>+</button>
            </div>
            {subs.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {subs.map((s, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded border bg-gray-50">
                    {s}
                    <button type="button" className="ml-2 text-red-600" onClick={()=>removeSub(i)}>x</button>
                  </span>
                ))}
              </div>
            )}
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

export default CategoryCreate;
