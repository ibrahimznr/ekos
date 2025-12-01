import React, { useEffect, useState } from "react";

function RaporModal({ open, onClose, mode = "create", initial = null, id = null }) {
  const [ekipman_adi, setEkipman] = useState("");
  const [kategori_id, setKategori] = useState("");
  const [firma, setFirma] = useState("");
  const [lokasyon, setLokasyon] = useState("");
  const [marka_model, setMarkaModel] = useState("");
  const [seri_no, setSeriNo] = useState("");
  const [alt_kategori, setAltKategori] = useState("");
  const [periyot, setPeriyot] = useState("");
  const [gecerlilik_tarihi, setGecerlilik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [uygunluk_durumu, setUygunluk] = useState("");
  const [kategoriler, setKategoriler] = useState([]);
  const [project_id, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);
  const [project_city, setProjectCity] = useState("");
  const [project_district, setProjectDistrict] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const humanSize = (n) => {
    if (!n && n !== 0) return "-";
    const k = 1024;
    const sizes = ["B","KB","MB","GB"];
    let i = 0; let v = n;
    while (v >= k && i < sizes.length-1) { v /= k; i++; }
    return `${v.toFixed(1)} ${sizes[i]}`;
  };
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (open) {
      if (initial) {
        setEkipman(initial.ekipman_adi || "");
        setKategori(initial.kategori_id || "");
        setFirma(initial.firma || "");
        setLokasyon(initial.lokasyon || "");
        setMarkaModel(initial.marka_model || "");
        setSeriNo(initial.seri_no || "");
        setAltKategori(initial.alt_kategori || "");
        setPeriyot(initial.periyot || "");
        setGecerlilik(initial.gecerlilik_tarihi || "");
        setAciklama(initial.aciklama || "");
        setUygunluk(initial.uygunluk_durumu || "");
        setProjectId(initial.project_id || "");
        setProjectCity(initial.project_city || "");
        setProjectDistrict(initial.project_district || "");
      } else {
        setEkipman("");
        setKategori("");
        setFirma("");
        setLokasyon("");
        setMarkaModel("");
        setSeriNo("");
        setAltKategori("");
        setPeriyot("");
        setGecerlilik("");
        setAciklama("");
        setUygunluk("");
        setProjectId("");
        setProjectCity("");
        setProjectDistrict("");
      }
      fetch("http://localhost:8000/kategoriler", { headers: { Authorization: `Bearer ${token}` } })
        .then(r=>r.json())
        .then(d=> setKategoriler(d.items||[]))
        .catch(()=> setKategoriler([]));
      fetch("http://localhost:8000/projeler", { headers: { Authorization: `Bearer ${token}` } })
        .then(r=>r.json())
        .then(d=> setProjects(d.items||[]))
        .catch(()=> setProjects([]));
    }
  }, [open, initial]);
  const payload = {
    ekipman_adi,
    kategori_id,
    firma,
    lokasyon,
    project_city,
    project_district,
    marka_model,
    seri_no,
    alt_kategori,
    periyot: periyot ? Number(periyot) : null,
    gecerlilik_tarihi,
    aciklama,
    uygunluk_durumu,
    project_id,
  };
  const save = async () => {
    const endpoint = id ? `http://localhost:8000/raporlar/${id}` : "http://localhost:8000/raporlar";
    const method = id ? "PUT" : "POST";
    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload)
    });
    if (!res.ok) return;
    let raporId = id;
    try {
      const data = await res.json();
      raporId = data?.id || raporId;
    } catch {}
    if (files.length > 0 && raporId) {
      setUploading(true);
      setUploadError("");
      for (const f of files) {
        const ct = f.type;
        const okType = ["application/pdf", "image/png", "image/jpeg"].includes(ct);
        if (!okType) { setUploadError("Desteklenmeyen dosya formatı"); continue; }
        if (f.size > 4 * 1024 * 1024 * 1024) { setUploadError("Dosya boyutu limiti aşıldı (4 GB)"); continue; }
        const fd = new FormData();
        fd.append("rapor_id", raporId);
        fd.append("file", f);
        const up = await fetch("http://localhost:8000/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
        if (!up.ok) {
          try {
            const err = await up.json();
            setUploadError(err?.detail || "Yükleme başarısız");
          } catch {
            setUploadError("Yükleme başarısız");
          }
        }
      }
      setUploading(false);
      setFiles([]);
    }
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-full max-w-xl space-y-2">
        <div className="font-medium">
          {mode === "view" ? "Rapor Detayı" : id ? "Raporu Düzenle" : "Yeni Rapor"}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input className="border p-2 w-full" placeholder="Ekipman adı" value={ekipman_adi} onChange={(e)=>setEkipman(e.target.value)} disabled={mode==="view"} />
          <select className="border p-2 w-full" value={kategori_id} onChange={(e)=>setKategori(e.target.value)} disabled={mode==="view"}>
            <option value="">Kategori</option>
            {kategoriler.map(k => (
              <option key={k.id} value={k.id}>{k.name}</option>
            ))}
          </select>
          <select className="border p-2 w-full col-span-2" value={project_id} onChange={(e)=>setProjectId(e.target.value)} disabled={mode==="view"}>
            <option value="">Proje (opsiyonel)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select className="border p-2 w-full" value={project_city} onChange={(e)=>setProjectCity(e.target.value)} disabled={mode==="view"}>
            <option value="">Proje İli (opsiyonel)</option>
            <option value="İstanbul">İstanbul</option>
            <option value="Ankara">Ankara</option>
            <option value="İzmir">İzmir</option>
            <option value="Bursa">Bursa</option>
            <option value="Antalya">Antalya</option>
            <option value="Kocaeli">Kocaeli</option>
            <option value="Konya">Konya</option>
            <option value="Gaziantep">Gaziantep</option>
            <option value="Mersin">Mersin</option>
            <option value="Adana">Adana</option>
            <option value="Kayseri">Kayseri</option>
            <option value="Eskişehir">Eskişehir</option>
            <option value="Samsun">Samsun</option>
            <option value="Trabzon">Trabzon</option>
            <option value="Şanlıurfa">Şanlıurfa</option>
            <option value="Diyarbakır">Diyarbakır</option>
            <option value="Malatya">Malatya</option>
          </select>
          <input className="border p-2 w-full" placeholder="Proje İlçesi (elle)" value={project_district} onChange={(e)=>setProjectDistrict(e.target.value)} disabled={mode==="view"} />
          <input className="border p-2 w-full" placeholder="Firma" value={firma} onChange={(e)=>setFirma(e.target.value)} disabled={mode==="view"} />
          <input className="border p-2 w-full" placeholder="Lokasyon" value={lokasyon} onChange={(e)=>setLokasyon(e.target.value)} disabled={mode==="view"} />
          <input className="border p-2 w-full" placeholder="Marka/Model" value={marka_model} onChange={(e)=>setMarkaModel(e.target.value)} disabled={mode==="view"} />
          <input className="border p-2 w-full" placeholder="Seri No" value={seri_no} onChange={(e)=>setSeriNo(e.target.value)} disabled={mode==="view"} />
          <input className="border p-2 w-full" placeholder="Alt Kategori" value={alt_kategori} onChange={(e)=>setAltKategori(e.target.value)} disabled={mode==="view"} />
          <select className="border p-2 w-full" value={periyot} onChange={(e)=>setPeriyot(e.target.value)} disabled={mode==="view"}>
            <option value="">Periyot</option>
            <option value="3">3 Ay</option>
            <option value="6">6 Ay</option>
            <option value="12">12 Ay</option>
          </select>
          <input className="border p-2 w-full" type="date" placeholder="Geçerlilik Tarihi" value={gecerlilik_tarihi || ""} onChange={(e)=>setGecerlilik(e.target.value)} disabled={mode==="view"} />
          <select className="border p-2 w-full" value={uygunluk_durumu} onChange={(e)=>setUygunluk(e.target.value)} disabled={mode==="view"}>
            <option value="">Uygunluk</option>
            <option value="uygun">Uygun</option>
            <option value="uygun_degil">Uygun Değil</option>
          </select>
          <input className="border p-2 w-full col-span-2" placeholder="Açıklama" value={aciklama} onChange={(e)=>setAciklama(e.target.value)} disabled={mode==="view"} />
        </div>
        <div className="space-y-2">
          {mode !== "view" && (
            <>
              <div className="text-sm font-medium">Medya Ekle (PDF, PNG, JPG, max 4 GB)</div>
              <input type="file" multiple accept=".pdf,image/png,image/jpeg,.jpg" onChange={(e)=>setFiles(Array.from(e.target.files||[]))} />
              {files.length > 0 && (
                <div className="text-xs text-gray-600">Seçilen dosyalar: {files.map(f=>f.name).join(', ')}</div>
              )}
              {uploadError && <div className="text-xs text-red-600">{uploadError}</div>}
              {uploading && <div className="text-xs text-gray-600">Medya yükleniyor...</div>}
            </>
          )}
          <div className="mt-2 space-y-2">
            <div className="text-sm font-medium">Medyalar</div>
            <div className="space-y-2">
              {(initial?.medyalar||[]).length === 0 && (
                <div className="text-xs text-gray-600">Medya bulunmuyor</div>
              )}
              {(initial?.medyalar||[]).map((m, idx) => {
                const base = "http://localhost:8000";
                const url = `${base}${m.url}`;
                const isImg = String(m.content_type||"").includes("image");
                return (
                  <div key={idx} className="flex items-center justify-between border rounded p-2">
                    <div className="flex items-center gap-3">
                      {isImg ? (
                        <img src={url} alt={m.filename} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center text-xs">{(m.content_type||'pdf').split('/').pop().toUpperCase()}</div>
                      )}
                      <div>
                        <div className="text-sm">{m.filename}</div>
                        <div className="text-xs text-gray-600">{humanSize(m.size)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={url} target="_blank" rel="noreferrer" className="px-2 py-1 border rounded">Önizle</a>
                      <a href={url} download className="px-2 py-1 border rounded">İndir</a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2">{mode === "view" ? "Kapat" : "İptal"}</button>
          {mode !== "view" && <button onClick={save} className="bg-ekos-primary text-white px-3 py-2">Kaydet</button>}
        </div>
      </div>
    </div>
  );
}

export default RaporModal;
