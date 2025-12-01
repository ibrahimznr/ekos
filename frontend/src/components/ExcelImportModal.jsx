import React, { useState } from "react";

function ExcelImportModal({ open, onClose }) {
  const [file, setFile] = useState(null);
  const token = localStorage.getItem("token");
  const submit = async () => {
    const fd = new FormData();
    fd.append("file", file);
    await fetch("http://localhost:8000/import-excel", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: fd
    });
    onClose();
  };
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-full max-w-md space-y-2">
        <div className="font-medium">Excel Yükle</div>
        <input type="file" onChange={(e)=>setFile(e.target.files[0])} />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2">İptal</button>
          <button onClick={submit} className="bg-ekos-primary text-white px-3 py-2">Yükle</button>
        </div>
      </div>
    </div>
  );
}

export default ExcelImportModal;
