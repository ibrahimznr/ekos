import React, { useEffect, useState } from "react";

function Profile() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [cropMode, setCropMode] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const load = async () => {
    const res = await fetch("http://localhost:8000/me", { headers: { Authorization: `Bearer ${token}` } });
    const d = await res.json();
    setEmail(d.email || "");
    setFullName(d.full_name || "");
    setAvatarUrl(d.avatar_url ? `http://localhost:8000${d.avatar_url}` : "");
  };
  useEffect(() => { load(); }, []);
  const save = async () => {
    setLoading(true);
    if (password || password2) {
      if (!password || password !== password2) {
        setToast({ type: "error", msg: "Şifreler uyuşmuyor" });
        setTimeout(()=>setToast(null), 2500);
        setLoading(false);
        return;
      }
    }
    const payload = { email, full_name: fullName };
    if (password) payload.password = password;
    const res = await fetch("http://localhost:8000/me", { method: "PUT", headers, body: JSON.stringify(payload) });
    if (res.ok) {
      setToast({ type: "success", msg: "Profil güncellendi" });
      setTimeout(()=>setToast(null), 2000);
    } else {
      const d = await res.json().catch(()=>({detail:"Hata"}));
      setToast({ type: "error", msg: d.detail || "Güncelleme başarısız" });
      setTimeout(()=>setToast(null), 2500);
    }
    setLoading(false);
  };
  const uploadAvatar = async () => {
    if (!file) return;
    if (cropMode) {
      const size = 240;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.src = previewUrl;
      await new Promise((resolve) => { img.onload = resolve; });
      const dw = imgSize.w * zoom;
      const dh = imgSize.h * zoom;
      const cx = size / 2;
      const cy = size / 2;
      const imgX = cx - dw / 2 + offset.x;
      const imgY = cy - dh / 2 + offset.y;
      let sx = (0 - imgX) / zoom;
      let sy = (0 - imgY) / zoom;
      let sW = size / zoom;
      let sH = size / zoom;
      if (sx < 0) { sW += sx; sx = 0; }
      if (sy < 0) { sH += sy; sy = 0; }
      if (sx + sW > imgSize.w) { sW = imgSize.w - sx; }
      if (sy + sH > imgSize.h) { sH = imgSize.h - sy; }
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, size, size);
      if (sW > 0 && sH > 0) {
        ctx.drawImage(img, sx, sy, sW, sH, 0, 0, size, size);
      }
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, file.type === "image/png" ? "image/png" : "image/jpeg", 0.92));
      if (!blob) return;
      const fd = new FormData();
      const ext = file.type === "image/png" ? "png" : "jpg";
      const name = (file.name || "avatar") + ".cropped." + ext;
      fd.append("file", new File([blob], name, { type: blob.type }));
      const res = await fetch("http://localhost:8000/me/avatar", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json().catch(()=>({}));
      if (res.ok) {
        setAvatarUrl(d.avatar_url ? `http://localhost:8000${d.avatar_url}` : avatarUrl);
        setFile(null);
        setPreviewUrl("");
        setCropMode(false);
        setOffset({ x: 0, y: 0 });
        setZoom(1);
        setToast({ type: "success", msg: "Fotoğraf yüklendi" });
        setTimeout(()=>setToast(null), 2000);
      } else {
        setToast({ type: "error", msg: d.detail || "Yükleme başarısız" });
        setTimeout(()=>setToast(null), 2500);
      }
    } else {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("http://localhost:8000/me/avatar", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: fd });
      const d = await res.json().catch(()=>({}));
      if (res.ok) {
        setAvatarUrl(d.avatar_url ? `http://localhost:8000${d.avatar_url}` : avatarUrl);
        setFile(null);
        setToast({ type: "success", msg: "Fotoğraf yüklendi" });
        setTimeout(()=>setToast(null), 2000);
      } else {
        setToast({ type: "error", msg: d.detail || "Yükleme başarısız" });
        setTimeout(()=>setToast(null), 2500);
      }
    }
  };
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-4 border-b">
          <div className="text-lg font-semibold">Profil Ayarları</div>
          <div className="text-sm text-gray-600">Kişisel bilgilerinizi güncelleyin ve fotoğraf yükleyin</div>
        </div>
        <div className="p-4 grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-sm">Fotoğraf yok</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={(e)=>{
                  const f = e.target.files?.[0]||null;
                  setFile(f);
                  if (f) {
                    const url = URL.createObjectURL(f);
                    setPreviewUrl(url);
                    setCropMode(true);
                    setZoom(1);
                    setOffset({ x: 0, y: 0 });
                  } else {
                    setPreviewUrl("");
                    setCropMode(false);
                  }
                }}
              />
              <button className="px-3 py-2 border rounded" onClick={uploadAvatar} disabled={!file}>{cropMode ? "Kırp ve Yükle" : "Fotoğraf Yükle"}</button>
              {cropMode && previewUrl && (
                <div className="w-full">
                  <div
                    className="relative mx-auto mt-2 border rounded"
                    style={{ width: 240, height: 240, overflow: "hidden", touchAction: "none", userSelect: "none" }}
                    onMouseDown={(e)=>{ setDragging(true); setLastPos({ x: e.clientX, y: e.clientY }); }}
                    onMouseMove={(e)=>{
                      if (!dragging) return;
                      const dx = e.clientX - lastPos.x;
                      const dy = e.clientY - lastPos.y;
                      setLastPos({ x: e.clientX, y: e.clientY });
                      setOffset((o)=>({ x: o.x + dx, y: o.y + dy }));
                    }}
                    onMouseUp={()=>setDragging(false)}
                    onMouseLeave={()=>setDragging(false)}
                    onTouchStart={(e)=>{ const t=e.touches[0]; setDragging(true); setLastPos({ x: t.clientX, y: t.clientY }); }}
                    onTouchMove={(e)=>{ if(!dragging) return; const t=e.touches[0]; const dx=t.clientX-lastPos.x; const dy=t.clientY-lastPos.y; setLastPos({ x:t.clientX, y:t.clientY }); setOffset((o)=>({ x:o.x+dx, y:o.y+dy })); }}
                    onTouchEnd={()=>setDragging(false)}
                  >
                    <img
                      src={previewUrl}
                      alt="preview"
                      onLoad={(e)=>{ const el=e.currentTarget; setImgSize({ w: el.naturalWidth, h: el.naturalHeight }); }}
                      style={{
                        position: "absolute",
                        left: "50%",
                        top: "50%",
                        transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(${zoom})`,
                        transformOrigin: "center",
                        userSelect: "none",
                        pointerEvents: "none"
                      }}
                    />
                    <div className="absolute inset-0 border-2 border-white pointer-events-none" />
                    <div className="absolute inset-0" style={{ boxShadow: "0 0 0 9999px rgba(0,0,0,0.25)", pointerEvents: "none" }} />
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <span className="text-xs text-gray-600">Yakınlaştır</span>
                    <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e)=>setZoom(parseFloat(e.target.value))} />
                    <button className="px-2 py-1 border rounded" onClick={()=>{ setCropMode(false); setPreviewUrl(""); setOffset({ x:0, y:0 }); setZoom(1); }}>İptal</button>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ad Soyad</label>
              <input className="w-full border rounded p-2" value={fullName} onChange={(e)=>setFullName(e.target.value)} placeholder="Ad Soyad" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">E-posta</label>
              <input className="w-full border rounded p-2" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="email" />
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Yeni Şifre</label>
                <input className="w-full border rounded p-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="********" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Yeni Şifre Tekrar</label>
                <input className="w-full border rounded p-2" type="password" value={password2} onChange={(e)=>setPassword2(e.target.value)} placeholder="********" />
              </div>
            </div>
            <div className="flex justify-end">
              <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={save} disabled={loading}>{loading ? "Kaydediliyor..." : "Kaydet"}</button>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div className={`fixed bottom-6 right-6 rounded shadow-lg px-4 py-3 ${toast.type==='success'?'bg-emerald-600':'bg-red-600'} text-white`}>{toast.msg}</div>
      )}
    </div>
  );
}

export default Profile;
