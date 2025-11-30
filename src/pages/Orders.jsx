import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No admin token found");
        setError("Not authenticated as admin");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${API_BASE}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`, // 🔑 admin JWT
        },
      });

      // Backend can return either an array or { orders: [...] }
      const normalizedOrders = Array.isArray(data) ? data : data.orders || [];
      setOrders(normalizedOrders);
    } catch (err) {
      console.error("Failed to load orders", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    if (status === "delivered") return "bg-green-100 text-green-700";
    if (status === "cancelled") return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-gray-600">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 text-left">Order ID</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Total</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr
                key={o._id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-3 font-mono">{o._id}</td>

                <td className="p-3">
                  {o.customer?.name || "N/A"}
                  <div className="text-xs text-gray-500">
                    {o.customer?.phone || o.customer?.mobile || ""}
                  </div>
                </td>

                <td className="p-3 font-semibold">
                  ₹{o.total ?? o.totalAmount ?? 0}
                </td>

                <td className="p-3 capitalize">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs ${
                      o.paymentStatus === "paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {o.paymentStatus || "pending"}
                  </span>
                </td>

                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(
                      o.status || "pending"
                    )}`}
                  >
                    {o.status || "pending"}
                  </span>
                </td>

                <td className="p-3 text-center">
                  <Link
                    to={`/orders/${o._id}`}
                    className="text-blue-600 hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}

            {orders.length === 0 && !error && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center p-6 text-gray-500"
                >
                  No orders found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
