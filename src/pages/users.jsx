import React, { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const token = localStorage.getItem("token"); // ✅ get stored JWT
        if (!token) {
          console.warn("⚠️ No token found. Please log in first.");
          setError("No authentication token found. Please log in again.");
          setLoading(false);
          return;
        }

        // ✅ Fetch all users from backend (admin route)
        const res = await axios.get(`${API_BASE}/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // ✅ handle response format safely
        const userData = Array.isArray(res.data)
          ? res.data
          : res.data.users || [];

        setUsers(userData);
      } catch (err) {
        console.error("❌ Failed to load users:", err.response?.data || err.message);
        setError(
          err.response?.data?.message ||
            "Failed to fetch users. Please check your admin login."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) return <div className="p-6 text-gray-600">Loading users...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">👥 Registered Users</h2>

      {users.length === 0 ? (
        <p className="text-gray-600">No users found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm bg-white rounded shadow">
            <thead className="bg-red-600 text-white">
              <tr>
                <th className="px-4 py-2 border">Name</th>
                <th className="px-4 py-2 border">Mobile</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Registered</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u._id}
                  className="text-center border hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 border">{u.name || "N/A"}</td>
                  <td className="px-4 py-2 border">{u.mobile || "N/A"}</td>
                  <td className="px-4 py-2 border">{u.email || "N/A"}</td>
                  <td className="px-4 py-2 border">
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Users;
