import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const [tab, setTab] = useState("kullanicilar");
  const [katName, setKatName] = useState("");
  const [katItems, setKatItems] = useState([]);
  const [usrItems, setUsrItems] = useState([]);
  const [projItems, setProjItems] = useState([]);
  const [newUser, setNewUser] = useState({ username: "", email: "", password: "", role: "inspector" });
  const [newProj, setNewProj] = useState({ name: "" });
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const oidToDate = (oid) => {
    try { const ts = parseInt(String(oid).substring(0,8), 16); return new Date(ts*1000); } catch { return null; }
  };
  const navigate = useNavigate();

  const loadCategories = async () => {
    const res = await fetch("http://localhost:8000/kategoriler", { headers });
    const data = await res.json();
    setKatItems(data.items || []);
  };
  const loadUsers = async () => {
    const res = await fetch("http://localhost:8000/users", { headers });
    const data = await res.json();
    setUsrItems(data.items || []);
  };
  const loadProjects = async () => {
    const res = await fetch("http://localhost:8000/projeler", { headers });
    const data = await res.json();
    setProjItems(data.items || []);
  };
  useEffect(() => { loadCategories(); loadUsers(); loadProjects(); }, []);

  const addCategory = async () => {
    await fetch("http://localhost:8000/kategoriler", { method: "POST", headers, body: JSON.stringify({ name: katName }) });
    setKatName("");
    loadCategories();
  };
  const editCategory = async (c) => {
    const name = prompt("Kategori adı", c.name);
    if (name === null) return;
    await fetch(`http://localhost:8000/kategoriler/${c.id}`, { method: "PUT", headers, body: JSON.stringify({ name }) });
    loadCategories();
  };
  const deleteCategory = async (c) => {
    await fetch(`http://localhost:8000/kategoriler/${c.id}`, { method: "DELETE", headers });
    loadCategories();
  };
  const addUser = async () => {
    await fetch("http://localhost:8000/users", { method: "POST", headers, body: JSON.stringify(newUser) });
    setNewUser({ username: "", email: "", password: "", role: "inspector" });
    loadUsers();
  };
  const editUser = async (u) => {
    const username = prompt("Kullanıcı adı", u.username);
    if (username === null) return;
    const email = prompt("E-posta", u.email);
    if (email === null) return;
    const role = prompt("Rol (inspector/viewer/admin)", u.role);
    if (role === null) return;
    await fetch(`http://localhost:8000/users/${u.id}`, { method: "PUT", headers, body: JSON.stringify({ username, email, role }) });
    loadUsers();
  };
  const deleteUser = async (u) => {
    await fetch(`http://localhost:8000/users/${u.id}`, { method: "DELETE", headers });
    loadUsers();
  };
  const addProject = async () => {
    await fetch("http://localhost:8000/projeler", { method: "POST", headers, body: JSON.stringify(newProj) });
    setNewProj({ name: "" });
    loadProjects();
  };
  const editProject = async (p) => {
    const name = prompt("Proje adı", p.name);
    if (name === null) return;
    await fetch(`http://localhost:8000/projeler/${p.id}`, { method: "PUT", headers, body: JSON.stringify({ name }) });
    loadProjects();
  };
  const deleteProject = async (p) => {
    await fetch(`http://localhost:8000/projeler/${p.id}`, { method: "DELETE", headers });
    loadProjects();
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-2xl font-semibold">
          <span className="inline-block w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">🔒</span>
          <span>Yönetim Paneli</span>
        </div>
        <div className="text-sm text-gray-600">Kullanıcı ve kategori yönetimi</div>
      </div>
      <div className="p-4 rounded-xl border bg-slate-50">
        <div className="flex items-center bg-white rounded-full p-1 w-fit shadow-sm border mb-4">
          <button className={`px-4 py-2 text-sm rounded-full ${tab==='kullanicilar' ? 'bg-blue-600 text-white' : 'text-gray-700'}`} onClick={()=>setTab('kullanicilar')}>👤 Kullanıcılar</button>
          <button className={`px-4 py-2 text-sm rounded-full ${tab==='kategoriler' ? 'bg-blue-600 text-white' : 'text-gray-700'}`} onClick={()=>setTab('kategoriler')}>🏷️ Kategoriler</button>
          <button className={`px-4 py-2 text-sm rounded-full ${tab==='projeler' ? 'bg-blue-600 text-white' : 'text-gray-700'}`} onClick={()=>setTab('projeler')}>📁 Projeler</button>
        </div>

      {tab === 'kullanicilar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{usrItems.length} kullanıcı</div>
            <button onClick={()=>navigate('/admin/kullanici-olustur')} className="px-4 py-2 rounded bg-blue-600 text-white">+ Yeni Kullanıcı</button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {usrItems.map(u => {
              const createdAt = oidToDate(u.id);
              const roleTr = u.role === 'admin' ? 'Yönetici' : (u.role === 'viewer' ? 'Görüntüleyici' : 'Inspector');
              const roleCls = u.role === 'admin' ? 'bg-purple-100 text-purple-700' : (u.role === 'viewer' ? 'bg-gray-100 text-gray-700' : 'bg-emerald-100 text-emerald-700');
              return (
                <div key={u.id} className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <input type="checkbox" />
                      <div className="font-semibold">@{u.username}</div>
                    </div>
                    <button className="text-red-600 text-sm" onClick={()=>deleteUser(u)}>🗑️</button>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{u.email}</div>
                  <div className={`inline-block text-xs mt-2 px-2 py-1 rounded ${roleCls}`}>{roleTr}</div>
                  <div className="text-xs text-gray-500 mt-2">Oluşturulma: {createdAt ? createdAt.toLocaleDateString('tr-TR') : '-'}</div>
                  <div className="mt-3">
                    <button className="px-2 py-1 border rounded text-sm" onClick={()=>editUser(u)}>Düzenle</button>
                  </div>
                </div>
              );
            })}
            {usrItems.length === 0 && (
              <div className="bg-white border rounded-xl p-4 text-gray-600">Henüz kullanıcı yok</div>
            )}
          </div>
          
        </div>
      )}

      {tab === 'kategoriler' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{katItems.length} kategori</div>
            <button onClick={()=>navigate('/admin/kategori-olustur')} className="px-4 py-2 rounded bg-blue-600 text-white">+ Yeni Kategori</button>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {katItems.map(c => {
              const createdAt = oidToDate(c.id);
              return (
                <div key={c.id} className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="font-semibold">{c.name}</div>
                    <button className="text-red-600 text-sm" onClick={()=>deleteCategory(c)}>🗑️</button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Oluşturulma: {createdAt ? createdAt.toLocaleDateString('tr-TR') : '-'}</div>
                  <div className="mt-3">
                    <button className="px-2 py-1 border rounded text-sm" onClick={()=>editCategory(c)}>Düzenle</button>
                  </div>
                </div>
              );
            })}
            {katItems.length === 0 && (
              <div className="bg-white border rounded-xl p-4 text-gray-600">Henüz kategori yok</div>
            )}
          </div>
          
        </div>
      )}

      {tab === 'projeler' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">{projItems.length} proje</div>
            <button onClick={()=>navigate('/admin/proje-olustur')} className="px-4 py-2 rounded bg-blue-600 text-white">+ Yeni Proje</button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            {projItems.map(p => {
              const createdAt = oidToDate(p.id);
              return (
                <div key={p.id} className="bg-white border rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="font-semibold">{p.name}</div>
                    <button className="text-red-600 text-sm" onClick={()=>deleteProject(p)}>🗑️</button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">Oluşturulma: {createdAt ? createdAt.toLocaleDateString('tr-TR') : '-'}</div>
                  <div className="mt-3">
                    <button className="px-2 py-1 border rounded text-sm" onClick={()=>editProject(p)}>Düzenle</button>
                  </div>
                </div>
              );
            })}
            {projItems.length === 0 && (
              <div className="bg-white border rounded-xl p-4 text-gray-600">Henüz proje bulunmuyor</div>
            )}
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default AdminPanel;
