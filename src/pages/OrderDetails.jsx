// dashboard/src/pages/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const OrderDetails = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/orders/${id}`);
      setOrder(data);
      setStatus(data.status);
    } catch (err) {
      console.error("Fetch order error", err);
    }
  };

  const updateStatus = async () => {
    try {
      await axios.put(`${API_BASE}/orders/${id}/status`, { status });
      alert("Updated");
      fetchOrder();
    } catch (err) {
      console.error("Update status err", err);
      alert("Failed");
    }
  };

  if (!order) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600">← Back</button>
      <h1 className="text-2xl font-bold mb-4">Order {order._id}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Customer</h3>
          <p>{order.customer?.name}</p>
          <p>{order.customer?.phone}</p>
          <p>{order.customer?.email}</p>
          <p className="mt-2 text-sm text-gray-600">{order.customer?.address?.line1}, {order.customer?.address?.city}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Order Info</h3>
          <p>Subtotal: ₹{order.subtotal}</p>
          <p>Total: ₹{order.total}</p>
          <p>Payment: {order.paymentStatus}</p>
          <p className="mt-2">Created: {new Date(order.createdAt).toLocaleString()}</p>

          <div className="mt-4">
            <label className="block text-sm mb-1">Update Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="border p-2 rounded w-full">
              <option value="created">created</option>
              <option value="confirmed">confirmed</option>
              <option value="packed">packed</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
            <button onClick={updateStatus} className="mt-3 bg-blue-600 text-white px-4 py-2 rounded">Save</button>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Items</h3>
        <ul>
          {order.items.map((it) => (
            <li key={it._id || it.productId} className="flex justify-between py-2 border-b">
              <div>
                <div className="font-medium">{it.name}</div>
                {it.variantLabel && <div className="text-sm text-gray-500">{it.variantLabel}</div>}
              </div>
              <div className="font-semibold">₹{it.price} × {it.qty}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderDetails;
