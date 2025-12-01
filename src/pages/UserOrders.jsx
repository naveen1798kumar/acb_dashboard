import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

const UserOrders = () => {
  const { id } = useParams(); // user ID from /users/:id/orders
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Not authenticated as admin");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${API_BASE}/orders/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500,
        });

        if (res.status === 404) {
          setOrders([]);
        } else {
          const data = res.data;
          const normalized = Array.isArray(data) ? data : data.orders || [];
          setOrders(normalized);
        }
      } catch (err) {
        console.error(
          "❌ Failed to load user orders:",
          err.response?.data || err.message
        );
        setError("Something went wrong while fetching user orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [id]);

  const getStatusColor = (status) => {
    if (status === "delivered") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "cancelled") return "bg-red-100 text-red-700 border-red-200";
    if (status === "shipped" || status === "packed")
      return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-amber-100 text-amber-700 border-amber-200";
  };

  const getPaymentColor = (status) => {
    if (status === "paid") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "failed") return "bg-red-100 text-red-700 border-red-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline text-sm"
        >
          ← Back
        </button>
        <div className="p-4 bg-red-100 text-red-700 rounded text-sm border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  const total = orders.reduce(
    (sum, o) => sum + (Number(o.total ?? o.totalAmount ?? 0) || 0),
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline text-sm"
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Orders for User</h2>
          <p className="text-sm text-slate-500">
            Showing all orders linked to this account.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Orders
            </div>
            <div className="text-lg font-semibold text-slate-900">{orders.length}</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400">
              Total Value
            </div>
            <div className="text-lg font-semibold text-emerald-700">
              ₹{total.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center text-slate-500 text-sm">
          No orders found for this user.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">User Orders</h3>
            <span className="text-xs text-slate-400">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-2 border-b text-left font-medium">Order ID</th>
                  <th className="px-4 py-2 border-b text-left font-medium">Total</th>
                  <th className="px-4 py-2 border-b text-left font-medium">Payment</th>
                  <th className="px-4 py-2 border-b text-left font-medium">Status</th>
                  <th className="px-4 py-2 border-b text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr
                    key={o._id}
                    className={`border-b text-sm ${
                      idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    } hover:bg-slate-50`}
                  >
                    <td className="px-4 py-2 border-r font-mono text-xs text-slate-700 break-all">
                      {o._id}
                    </td>
                    <td className="px-4 py-2 border-r font-semibold">
                      ₹{(o.total ?? o.totalAmount ?? 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2 border-r">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${getPaymentColor(
                          o.paymentStatus
                        )}`}
                      >
                        {o.paymentStatus || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-r">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border font-medium ${getStatusColor(
                          o.status
                        )}`}
                      >
                        {o.status || "pending"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <Link
                        to={`/orders/${o._id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrders;
