import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function ExcelImport() {
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("");
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const res = await fetch("http://localhost:8000/projeler", { headers });
        const data = await res.json();
        setProjects(data.items || []);
      } catch {
        setProjects([]);
      }
    };
    loadProjects();
  }, []);
  const downloadTemplate = async () => {
    const res = await fetch("http://localhost:8000/export-excel?template=1", { headers });
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ekos-template.xlsx";
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const importExcel = async () => {
    setError("");
    if (!file) { setError("Lütfen dosya seçin"); return; }
    setLoading(true);
    const fd = new FormData();
    fd.append("file", file);
    if (selectedProject) fd.append("project_id", selectedProject);
    const res = await fetch("http://localhost:8000/import-excel", { method: "POST", headers, body: fd });
    setLoading(false);
    if (res.ok) {
      const data = await res.json().catch(()=>({imported:0}));
      setToast({ type: "success", msg: `${data.imported} kayıt içe aktarıldı` });
      setTimeout(()=>{ setToast(null); navigate("/raporlar"); }, 1500);
    } else {
      const data = await res.json().catch(()=>({detail:"İçe aktarma başarısız"}));
      setToast({ type: "error", msg: data.detail || "İçe aktarma başarısız" });
      setTimeout(()=> setToast(null), 3000);
    }
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Excel İçe Aktarma</div>
          <div className="text-sm text-gray-600">Excel dosyasından toplu rapor içe aktarma</div>
        </div>
        <div className="p-4 space-y-6">
          <div className="rounded-xl border bg-emerald-50 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">0. Proje Seçin</div>
              <div className="text-xs text-gray-700">İçe aktarılacak kayıtlar için hedef projeyi seçin.</div>
            </div>
            <div className="flex items-center gap-2">
              <select className="border rounded p-2" value={selectedProject} onChange={(e)=>setSelectedProject(e.target.value)}>
                <option value="">Seçiniz</option>
                {projects.map(p=> (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <button className="px-4 py-2 rounded border" onClick={()=>navigate('/admin/proje-olustur')}>Proje Ekle</button>
            </div>
          </div>
          <div className="rounded-xl border bg-blue-50 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">1. Şablonu İndirin</div>
              <div className="text-xs text-gray-700">Önce Excel şablonunu indirin ve verilerinizi bu şablona göre hazırlayın.</div>
            </div>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={downloadTemplate}>İndir</button>
          </div>
          <div className="rounded-xl border border-dashed p-8 text-center bg-gray-50">
            <div className="text-3xl">⬆️</div>
            <div className="font-medium mt-2">2. Excel Dosyasını Yükleyin</div>
            <div className="text-xs text-gray-700">Doldurduğunuz Excel dosyasını seçin</div>
            <div className="mt-3">
              <input type="file" accept=".xlsx,.xls" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
            </div>
          </div>
          <div className="rounded-xl border p-4 bg-gray-50">
            <div className="font-medium">Önemli Notlar:</div>
            <ul className="text-sm text-gray-700 list-disc ml-5 mt-2 space-y-1">
              <li>Ekipman Adı, Kategori ve Firma alanları zorunludur</li>
              <li>Geçerlilik Tarihi formatı: YYYY-MM-DD (ör. 2025-12-31)</li>
              <li>Periyot: 3 Ay, 6 Ay veya 12 Ay olmalıdır</li>
              <li>Uygunluk: Uygun veya Uygun Değil olmalıdır</li>
              <li>Opsiyonel sütunlar: Proje, Proje İli, Proje İlçesi</li>
              <li>Proje sütununda proje ID veya adı kullanabilirsiniz</li>
              <li>Boş satırlar atlanır</li>
            </ul>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 rounded border" onClick={()=>navigate('/raporlar')}>Kapat</button>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={importExcel} disabled={loading}>{loading? 'İçe aktarılıyor...' : 'İçe Aktar'}</button>
          </div>
        </div>
      </div>
      {toast && (
        <div className={`fixed bottom-6 right-6 rounded shadow-lg px-4 py-3 ${toast.type==='success'?'bg-emerald-600':'bg-red-600'} text-white`}>{toast.msg}</div>
      )}
    </div>
  );
}

export default ExcelImport;
