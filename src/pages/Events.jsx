// dashboard/src/pages/Events.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  Edit3,
  Trash2,
  ArrowRight,
  PlusCircle,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Events = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const API_URL = `${API_BASE}/events`;

  // ✅ Fetch events
  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(API_URL);
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching events:", err);
      setEvents([]);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // ✅ Create / Update Event
  const handleSubmit = async () => {
    const { name, description, startDate, endDate, image } = formData;
    if (!name.trim()) return alert("Event name is required!");

    const form = new FormData();
    form.append("name", name);
    form.append("description", description);
    if (startDate) form.append("startDate", startDate);
    if (endDate) form.append("endDate", endDate);
    if (image) form.append("image", image);

    try {
      setLoading(true);
      if (editingEvent) {
        await axios.put(`${API_URL}/${editingEvent._id}`, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Event updated successfully!");
      } else {
        await axios.post(API_URL, form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("✅ Event added successfully!");
      }
      setFormData({
        name: "",
        description: "",
        startDate: "",
        endDate: "",
        image: null,
      });
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      console.error("❌ Error saving event:", err);
      alert("Failed to save event.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Delete Event
  const deleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setEvents(events.filter((e) => e._id !== id));
    } catch (err) {
      console.error("❌ Error deleting event:", err);
      alert("Failed to delete event.");
    }
  };

  // ✅ Toggle Event Activation
  const toggleActive = async (event) => {
    try {
      const updated = { ...event, isActive: !event.isActive };
      await axios.put(`${API_URL}/${event._id}`, { isActive: updated.isActive });
      setEvents((prev) =>
        prev.map((e) => (e._id === event._id ? updated : e))
      );
    } catch (err) {
      console.error("❌ Error toggling event:", err);
    }
  };

  // ✅ Edit Event
  const startEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description,
      startDate: event.startDate?.split("T")[0] || "",
      endDate: event.endDate?.split("T")[0] || "",
      image: null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Cancel Editing
  const cancelEdit = () => {
    setEditingEvent(null);
    setFormData({
      name: "",
      description: "",
      startDate: "",
      endDate: "",
      image: null,
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <CalendarDays className="text-blue-600" /> Manage Events
        </h1>
      </div>

      {/* Create/Edit Event Form */}
      <div className="bg-white p-6 rounded-xl shadow-md border mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {editingEvent ? "✏️ Edit Event" : "➕ Add New Event"}
          </h2>
          {editingEvent && (
            <button
              onClick={cancelEdit}
              className="text-sm text-gray-600 hover:text-red-600"
            >
              Cancel
            </button>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Event Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Short Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.startDate}
            onChange={(e) =>
              setFormData({ ...formData, startDate: e.target.value })
            }
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="date"
            value={formData.endDate}
            onChange={(e) =>
              setFormData({ ...formData, endDate: e.target.value })
            }
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.files[0] })
            }
            className="border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition disabled:bg-gray-400"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Saving...
              </span>
            ) : editingEvent ? (
              "Update Event"
            ) : (
              "Add Event"
            )}
          </button>
        </div>
      </div>

      {/* Event List */}
      {events.length === 0 ? (
        <div className="text-center text-gray-500 py-20 bg-white rounded-lg shadow">
          <PlusCircle size={40} className="mx-auto text-gray-400 mb-2" />
          <p>No events found. Start by adding one above!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white rounded-xl shadow border hover:shadow-lg transition-all duration-200 overflow-hidden"
            >
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="w-full h-44 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center justify-between">
                  {event.name}
                  <button
                    onClick={() => toggleActive(event)}
                    className={`w-10 h-5 flex items-center rounded-full transition ${
                      event.isActive ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`h-4 w-4 bg-white rounded-full shadow transform transition ${
                        event.isActive ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </h3>

                <p className="text-gray-600 text-sm mt-1">
                  {event.description || "No description"}
                </p>

                {(event.startDate || event.endDate) && (
                  <p className="text-xs text-gray-500 mt-2">
                    📅{" "}
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString()
                      : "Ongoing"}{" "}
                    →{" "}
                    {event.endDate
                      ? new Date(event.endDate).toLocaleDateString()
                      : "No end date"}
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Products Linked: {event.products?.length || 0}
                </p>

                <div className="flex justify-between items-center mt-3">
                  <button
                    onClick={() => navigate(`/events/${event._id}/manage`)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    Manage <ArrowRight size={14} />
                  </button>
                  <div className="flex gap-3 text-gray-600">
                    <button
                      onClick={() => startEdit(event)}
                      className="hover:text-blue-600"
                    >
                      <Edit3 size={18} />
                    </button>
                    <button
                      onClick={() => deleteEvent(event._id)}
                      className="hover:text-red-600"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>

              <div
                className={`text-center py-1 text-xs font-semibold ${
                  event.isActive
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {event.isActive ? (
                  <span className="flex items-center justify-center gap-1">
                    <CheckCircle size={12} /> Active
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1">
                    <XCircle size={12} /> Inactive
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
