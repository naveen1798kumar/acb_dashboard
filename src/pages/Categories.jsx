import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2, ImagePlus, Edit3, Save, X } from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState(null);

  const [subName, setSubName] = useState({});
  const [addingSub, setAddingSub] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL;
  const API_URL = `${API_BASE}/categories`;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file || null);
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  const addCategory = async () => {
    if (!name.trim()) return alert("Please enter a category name!");
    const formData = new FormData();
    formData.append("name", name.trim());
    if (image) formData.append("image", image);

    try {
      setAdding(true);
      const { data } = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories((prev) => [...prev, data]);
      setName("");
      setImage(null);
      setImagePreview(null);
    } catch (err) {
      alert(err.response?.data?.message || "Error adding category!");
    } finally {
      setAdding(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      alert("Failed to delete category!");
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat._id);
    setEditName(cat.name);
    setEditImage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditImage(null);
  };

  const saveEdit = async (id) => {
    const formData = new FormData();
    formData.append("name", editName);
    if (editImage) formData.append("image", editImage);

    try {
      const { data } = await axios.put(`${API_URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories((prev) => prev.map((c) => (c._id === id ? data : c)));
      cancelEdit();
    } catch (err) {
      alert("Failed to update category!");
    }
  };

  const addSubcategory = async (categoryId) => {
    const subcategoryName = subName[categoryId]?.trim();
    if (!subcategoryName) return alert("Enter subcategory name!");
    try {
      setAddingSub((prev) => ({ ...prev, [categoryId]: true }));
      const { data } = await axios.post(`${API_URL}/${categoryId}/subcategories`, {
        name: subcategoryName,
      });
      setCategories((prev) => prev.map((cat) => (cat._id === categoryId ? data : cat)));
      setSubName((prev) => ({ ...prev, [categoryId]: "" }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add subcategory!");
    } finally {
      setAddingSub((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
        {loading && <span className="text-sm text-gray-500 animate-pulse">Fetching categories...</span>}
      </div>

      {/* Add Category */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <label className="cursor-pointer flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-100 transition">
          <ImagePlus size={18} />
          Upload Image
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
        {imagePreview && (
          <img
            src={imagePreview}
            alt="preview"
            className="w-14 h-14 object-cover rounded-lg border border-gray-200"
          />
        )}
        <button
          onClick={addCategory}
          disabled={adding}
          className={`px-5 py-3 rounded-lg text-white font-medium shadow transition 
            ${adding ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {adding ? "Adding..." : "Add Category"}
        </button>
      </div>

      {/* Category List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            {loading ? "Loading..." : "No categories yet."}
          </p>
        ) : (
          <ul>
            {categories.map((c) => (
              <li key={c._id} className="px-4 py-4 border-b last:border-none hover:bg-gray-50 transition">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    {c.image && (
                      <img
                        src={c.image}
                        alt={c.name}
                        className="w-14 h-14 object-cover rounded-md border border-gray-200"
                      />
                    )}

                    {editingId === c._id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border p-2 rounded-lg w-48 focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-gray-800 font-semibold text-lg">{c.name}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingId === c._id ? (
                      <>
                        <label className="cursor-pointer text-blue-600 flex items-center gap-1">
                          <ImagePlus size={16} />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setEditImage(e.target.files[0] || null)}
                            className="hidden"
                          />
                        </label>
                        <button
                          onClick={() => saveEdit(c._id)}
                          className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"
                        >
                          <Save size={16} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-gray-600 hover:text-gray-800 flex items-center gap-1 text-sm"
                        >
                          <X size={16} /> Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(c)}
                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => deleteCategory(c._id)}
                          className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subcategories */}
                <div className="ml-4 mt-3">
                  <div className="flex gap-2 items-center mb-2">
                    <input
                      type="text"
                      placeholder="Add subcategory..."
                      value={subName[c._id] || ""}
                      onChange={(e) =>
                        setSubName((prev) => ({ ...prev, [c._id]: e.target.value }))
                      }
                      className="border p-2 rounded w-1/2"
                    />
                    <button
                      onClick={() => addSubcategory(c._id)}
                      disabled={addingSub[c._id]}
                      className={`px-3 py-1 rounded text-white text-sm ${
                        addingSub[c._id] ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {addingSub[c._id] ? "Adding..." : "Add"}
                    </button>
                  </div>

                  {c.subcategories?.length > 0 && (
                    <ul className="ml-2">
                      {c.subcategories.map((sc, idx) => (
                        <li key={idx} className="text-gray-700 text-sm">
                          • {sc.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Categories;
