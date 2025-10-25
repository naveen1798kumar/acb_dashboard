import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const loadUsers = async () => {
      const res = await axios.get(`${API_BASE}/auth/users`);
      setUsers(res.data);
    };
    loadUsers();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Registered Users</h2>
      <table className="min-w-full border text-sm">
        <thead className="bg-red-600 text-white">
          <tr>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Phone</th>
            <th className="px-4 py-2 border">Registered</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id} className="text-center border">
              <td className="px-4 py-2 border">{u.name}</td>
              <td className="px-4 py-2 border">{u.phone}</td>
              <td className="px-4 py-2 border">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Users;
