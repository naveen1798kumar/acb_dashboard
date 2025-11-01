// dashboard/src/pages/Orders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

const Orders = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/orders`);
      // If backend returns {orders: [...]}, normalize it
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="bg-white rounded shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
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
              <tr key={o._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{o._id}</td>
                <td className="p-3">
                  {o.customer?.name || "N/A"}{" "}
                  <div className="text-xs text-gray-500">{o.customer?.phone}</div>
                </td>
                <td className="p-3">₹{o.total}</td>
                <td className="p-3 capitalize">{o.paymentStatus}</td>
                <td
                  className={`p-3 font-semibold ${
                    o.status === "delivered"
                      ? "text-green-600"
                      : o.status === "cancelled"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {o.status}
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
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-500">
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
