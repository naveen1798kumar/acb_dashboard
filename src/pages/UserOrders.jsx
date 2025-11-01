import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const UserOrders = () => {
  const { id } = useParams(); // user ID from route /users/:id/orders
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE}/orders/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
          validateStatus: (status) => status < 500, // ✅ prevent throwing for 404
        });

        if (res.status === 404) {
          setOrders([]); // ✅ no orders for this user
        } else {
          const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
          setOrders(data);
        }
      } catch (err) {
        console.error("❌ Failed to load user orders:", err);
        setError("Something went wrong while fetching user orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">
        ← Back
      </button>
      <h2 className="text-2xl font-semibold mb-4">🧾 Orders for User</h2>

      {orders.length === 0 ? (
        <p className="text-gray-600">No orders found for this user.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm bg-white rounded shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Order ID</th>
                <th className="px-4 py-2 border">Total</th>
                <th className="px-4 py-2 border">Payment</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="text-center border hover:bg-gray-50">
                  <td className="px-4 py-2 border">{o._id}</td>
                  <td className="px-4 py-2 border">₹{o.total}</td>
                  <td className="px-4 py-2 border capitalize">{o.paymentStatus}</td>
                  <td className="px-4 py-2 border capitalize">{o.status}</td>
                  <td className="px-4 py-2 border">
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
