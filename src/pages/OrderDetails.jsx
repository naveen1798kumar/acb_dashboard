// dashboard/src/pages/OrderDetails.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000/api";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated as admin");
        setLoading(false);
        return;
      }

      const { data } = await axios.get(`${API_BASE}/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const o = data.order || data; // support { order } or plain object

      setOrder(o);
      setStatus(o.status || "created");
    } catch (err) {
      console.error("Fetch order error", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Not authenticated as admin");
        setSaving(false);
        return;
      }

      await axios.put(
        `${API_BASE}/orders/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Order status updated");
      fetchOrder();
    } catch (err) {
      console.error("Update status error", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen text-gray-600">
        Loading order...
      </div>
    );
  }

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

  if (!order) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back
        </button>
        <p className="text-gray-600">Order not found.</p>
      </div>
    );
  }

  const customer = order.customer || {};
  const address = customer.address || order.shippingAddress || {};
  const items = order.items || order.cartItems || [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">
        Order <span className="font-mono">{order._id}</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Customer */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Customer</h3>
          <p className="font-medium">{customer.name || "N/A"}</p>
          <p className="text-sm text-gray-700">
            {customer.phone || customer.mobile || "No phone"}
          </p>
          <p className="text-sm text-gray-700">
            {customer.email || "No email"}
          </p>

          <p className="mt-3 text-sm text-gray-600">
            {address.line1 || address.addressLine1 || ""}
            {address.city && `, ${address.city}`}
            {address.pincode && ` - ${address.pincode}`}
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-2">Order Info</h3>
          <p>Subtotal: ₹{order.subtotal ?? order.subTotal ?? 0}</p>
          <p>Total: ₹{order.total ?? order.totalAmount ?? 0}</p>
          <p>Payment: {order.paymentStatus || "pending"}</p>
          <p className="mt-2 text-sm text-gray-700">
            Created:{" "}
            {order.createdAt
              ? new Date(order.createdAt).toLocaleString()
              : "N/A"}
          </p>

          <div className="mt-4">
            <label className="block text-sm mb-1 font-medium">
              Update Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border p-2 rounded w-full"
            >
              <option value="created">created</option>
              <option value="confirmed">confirmed</option>
              <option value="packed">packed</option>
              <option value="shipped">shipped</option>
              <option value="delivered">delivered</option>
              <option value="cancelled">cancelled</option>
            </select>
            <button
              onClick={updateStatus}
              disabled={saving}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="mt-6 bg-white p-4 rounded shadow">
        <h3 className="font-semibold mb-2">Items</h3>
        {items.length === 0 ? (
          <p className="text-gray-600 text-sm">No items found for this order.</p>
        ) : (
          <ul>
            {items.map((it, idx) => (
              <li
                key={it._id || it.productId || idx}
                className="flex justify-between py-2 border-b last:border-b-0"
              >
                <div>
                  <div className="font-medium">
                    {it.name || it.product?.name || "Product"}
                  </div>
                  {it.variantLabel && (
                    <div className="text-sm text-gray-500">
                      {it.variantLabel}
                    </div>
                  )}
                </div>
                <div className="font-semibold text-sm">
                  ₹{it.price} × {it.qty || it.quantity || 1}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
