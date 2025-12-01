import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const { data } = await axios.get(`${API_BASE}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const normalized = Array.isArray(data) ? data : data.orders || [];
      setOrders(normalized);
    } catch (err) {
      console.error("Failed to load orders", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="p-6 text-gray-600">
        <div className="animate-pulse h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="animate-pulse h-10 w-full bg-gray-200 rounded" />
      </div>
    );
  }

  const totalRevenue = orders.reduce(
    (sum, o) => sum + (Number(o.total ?? o.totalAmount ?? 0) || 0),
    0
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">
            Track all customer orders and their current status.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400">Total Orders</div>
            <div className="text-lg font-semibold text-slate-900">{orders.length}</div>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <div className="text-xs uppercase tracking-wide text-slate-400">Revenue</div>
            <div className="text-lg font-semibold text-emerald-700">
              ₹{totalRevenue.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">All Orders</h2>
          <span className="text-xs text-slate-400">
            Latest first • {orders.length} record{orders.length !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-3 text-left font-medium">Order</th>
                <th className="p-3 text-left font-medium">Customer</th>
                <th className="p-3 text-left font-medium">Total</th>
                <th className="p-3 text-left font-medium">Payment</th>
                <th className="p-3 text-left font-medium">Status</th>
                <th className="p-3 text-center font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, idx) => {
                const isStriped = idx % 2 === 1;
                const customer = o.customer || {};
                return (
                  <tr
                    key={o._id}
                    className={`transition-colors ${
                      isStriped ? "bg-slate-50/40" : "bg-white"
                    } hover:bg-slate-50`}
                  >
                    {/* Order ID + date */}
                    <td className="p-3 align-top">
                      <div className="font-mono text-xs text-slate-700 break-all">
                        {o._id}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        {o.createdAt
                          ? new Date(o.createdAt).toLocaleString()
                          : "No date"}
                      </div>
                    </td>

                    {/* Customer */}
                    <td className="p-3 align-top">
                      <div className="font-medium text-slate-800">
                        {customer.name || "Guest"}
                      </div>
                      {customer.phone && (
                        <div className="text-xs text-slate-500">{customer.phone}</div>
                      )}
                      {customer.email && (
                        <div className="text-xs text-slate-400">{customer.email}</div>
                      )}
                    </td>

                    {/* Total */}
                    <td className="p-3 align-top font-semibold text-slate-900">
                      ₹{(o.total ?? o.totalAmount ?? 0).toLocaleString("en-IN")}
                    </td>

                    {/* Payment */}
                    <td className="p-3 align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border ${getPaymentColor(
                          o.paymentStatus
                        )}`}
                      >
                        {o.paymentStatus || "pending"}
                      </span>
                      {o.paymentMethod && (
                        <div className="text-[11px] text-slate-400 mt-1">
                          {o.paymentMethod.toUpperCase()}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-3 align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] border font-medium ${getStatusColor(
                          o.status
                        )}`}
                      >
                        {o.status || "created"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 align-top text-center">
                      <Link
                        to={`/orders/${o._id}`}
                        className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-full border border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        View details
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center p-8 text-slate-500 text-sm"
                  >
                    No orders found yet.
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

export default Orders;
