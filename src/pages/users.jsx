import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

const loadUsers = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No admin token found");
      return;
    }

    const res = await axios.get(`${API_BASE}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUsers(res.data?.users || []);
  } catch (err) {
    console.error("Failed to load users", err.response?.data || err.message);
  } finally {
    setLoading(false);
  }
};


  if (loading) return <div className="p-6 text-gray-600">Loading users...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Registered Users</h2>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-red-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Mobile</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Registered</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t hover:bg-gray-50 transition">
                <td className="px-4 py-3">{u.name}</td>
                <td className="px-4 py-3">{u.mobile || "N/A"}</td>
                <td className="px-4 py-3">{u.email || "N/A"}</td>
                <td className="px-4 py-3">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>

                <td className="px-4 py-3 text-center">
                  <Link
                    to={`/users/${u._id}/orders`}
                    className="text-blue-600 hover:underline"
                  >
                    View Orders
                  </Link>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-6 text-gray-500">
                  No users registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;
