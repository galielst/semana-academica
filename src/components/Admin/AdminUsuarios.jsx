// ./components/Admin/AdminUsuarios.jsx
import React from "react";

export default function AdminUsuarios({ usuarios, acciones }) {
  return (
    <section className="bg-white p-5 rounded-2xl shadow-sm border">
      <h3 className="text-xl font-semibold mb-3">Usuarios</h3>
      <table className="min-w-full text-sm border">
        <thead>
          <tr className="border-b">
            <th className="py-2 px-3">#</th>
            <th className="py-2 px-3">Nombre</th>
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Rol</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u, idx) => (
            <tr key={u.id} className="border-b">
              <td className="py-2 px-3">{idx + 1}</td>
              <td className="py-2 px-3">{u.nombre}</td>
              <td className="py-2 px-3">{u.email}</td>
              <td className="py-2 px-3">{u.rol}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
