import React from "react";

function RaporDetailModal({ open, onClose, rapor }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-4 rounded w-full max-w-md">
        <div className="font-medium mb-2">Rapor Detayı</div>
        <div className="text-sm">Rapor No: {rapor?.rapor_no}</div>
        <div className="text-sm">Ekipman: {rapor?.ekipman_adi}</div>
        <div className="text-sm">Firma: {rapor?.firma}</div>
        <button onClick={onClose} className="mt-4 bg-ekos-primary text-white px-3 py-2">Kapat</button>
      </div>
    </div>
  );
}

export default RaporDetailModal;
