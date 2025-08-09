"use client";

import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role_id: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, rRes] = await Promise.all([
          fetch('/api/users'),
          fetch('/api/roles'),
        ]);
        const u = await uRes.json();
        const r = await rRes.json();
        setUsers(u);
        setRoles(r);
      } catch {
        toast.error('Failed to load users/roles');
      }
    };
    load();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('User created');
      setUsers((prev) => [...prev, data]);
      setForm({ name: '', email: '', password: '', role_id: '' });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Users</h1>
      <form onSubmit={onSubmit} className="grid grid-cols-2 gap-3 bg-white p-4 rounded-lg border">
        <input className="border p-2 rounded" placeholder="Name" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <input className="border p-2 rounded" placeholder="Email" type="email" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
        <input className="border p-2 rounded" placeholder="Password" type="password" value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
        <select className="border p-2 rounded" value={form.role_id} onChange={(e)=>setForm({...form,role_id:e.target.value})}>
          <option value="">Select role</option>
          {roles.map(r => (<option key={r.id} value={r.id}>{r.name}</option>))}
        </select>
        <button disabled={loading} className="col-span-2 bg-cyan-600 text-white rounded p-2">{loading?'Saving...':'Add User'}</button>
      </form>

      <div className="mt-6 bg-white border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Existing Users</h2>
        <ul className="space-y-1">
          {users.map(u => (
            <li key={u.id} className="text-sm text-gray-700">{u.name} — {u.email} ({u.role})</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
