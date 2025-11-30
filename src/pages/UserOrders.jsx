// dashboard/src/pages/UserOrders.jsx
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
          validateStatus: (status) => status < 500, // don't throw on 404
        });

        if (res.status === 404) {
          setOrders([]);
        } else {
          const data = res.data;
          const normalized = Array.isArray(data) ? data : data.orders || [];
          setOrders(normalized);
        }
      } catch (err) {
        console.error("❌ Failed to load user orders:", err.response?.data || err.message);
        setError("Something went wrong while fetching user orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <div className="p-4 bg-red-100 text-red-700 rounded text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>
      <h2 className="text-2xl font-semibold mb-4">Orders for User</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found for this user.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border text-left">Order ID</th>
                <th className="px-4 py-2 border text-left">Total</th>
                <th className="px-4 py-2 border text-left">Payment</th>
                <th className="px-4 py-2 border text-left">Status</th>
                <th className="px-4 py-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr
                  key={o._id}
                  className="border-t hover:bg-gray-50 transition text-sm"
                >
                  <td className="px-4 py-2 border font-mono">{o._id}</td>
                  <td className="px-4 py-2 border font-semibold">
                    ₹{o.total ?? o.totalAmount ?? 0}
                  </td>
                  <td className="px-4 py-2 border capitalize">
                    {o.paymentStatus || "pending"}
                  </td>
                  <td className="px-4 py-2 border capitalize">
                    {o.status || "pending"}
                  </td>
                  <td className="px-4 py-2 border text-center">
                    <Link
                      to={`/orders/${o._id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
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

export default UserOrders;
