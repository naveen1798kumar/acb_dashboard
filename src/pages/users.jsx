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
        setLoading(false);
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

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="animate-pulse h-7 w-48 bg-gray-200 rounded mb-4" />
        <div className="animate-pulse h-40 w-full bg-gray-200 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header + stats */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Registered Users</h2>
          <p className="text-sm text-slate-500">
            All customers who have created an account on ACB Bakery.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Total Users
            </div>
            <div className="text-lg font-semibold text-slate-900">
              {users.length}
            </div>
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Users list</h3>
          <span className="text-xs text-slate-400">
            {users.length} user{users.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left font-medium">User</th>
                <th className="px-4 py-2 text-left font-medium">Mobile</th>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-left font-medium">Registered</th>
                <th className="px-4 py-2 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u, idx) => {
                const initials =
                  (u.name || "")
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase() || "U";

                const rowStriped = idx % 2 === 1;

                return (
                  <tr
                    key={u._id}
                    className={`border-t border-slate-100 ${
                      rowStriped ? "bg-slate-50/40" : "bg-white"
                    } hover:bg-slate-50 transition-colors`}
                  >
                    {/* User + avatar */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 text-red-700 flex items-center justify-center text-xs font-semibold">
                          {initials}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">
                            {u.name || "Unnamed user"}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            ID: {u._id}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Mobile */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      {u.mobile || (
                        <span className="text-slate-400 text-xs">No mobile</span>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      {u.email ? (
                        <span>{u.email}</span>
                      ) : (
                        <span className="text-slate-400 text-xs">No email</span>
                      )}
                    </td>

                    {/* Registered date */}
                    <td className="px-4 py-3 align-top text-slate-700">
                      {u.createdAt ? (
                        <>
                          <div className="text-sm">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {new Date(u.createdAt).toLocaleTimeString()}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs">N/A</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center align-top">
                      <Link
                        to={`/users/${u._id}/orders`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        View Orders
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center p-8 text-slate-500 text-sm"
                  >
                    No users registered yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
