import React, { useEffect, useState } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [subName, setSubName] = useState({});
  const [addingSub, setAddingSub] = useState({});

  const API_BASE = import.meta.env.VITE_API_URL;
  const API_URL = `${API_BASE}/categories`;

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(API_URL);
      if (Array.isArray(data)) {
        setCategories(data);
      } else if (Array.isArray(data.categories)) {
        setCategories(data.categories);
      } else {
        setCategories([]);
      }
    } catch (err) {
      console.error("❌ Error fetching categories:", err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Add new category
  const addCategory = async () => {
    if (!name.trim()) return alert("Please enter a category name!");
    try {
      setAdding(true);
      const { data } = await axios.post(API_URL, { name: name.trim() });
      setCategories((prev) => [...prev, data]);
      setName("");
    } catch (err) {
      if (err.response?.status === 400) alert("Category already exists!");
      else console.error("❌ Error adding category:", err);
    } finally {
      setAdding(false);
    }
  };

  // Delete category
  const deleteCategory = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error("❌ Error deleting category:", err);
      alert("Failed to delete category!");
    }
  };

  // Add subcategory
  const addSubcategory = async (categoryId) => {
    const subcategoryName = subName[categoryId]?.trim();
    if (!subcategoryName) return alert("Enter subcategory name!");
    try {
      setAddingSub((prev) => ({ ...prev, [categoryId]: true }));
      const { data } = await axios.post(
        `${API_URL}/${categoryId}/subcategories`,
        { name: subcategoryName }
      );
      setCategories((prev) =>
        prev.map((cat) => (cat._id === categoryId ? data : cat))
      );
      setSubName((prev) => ({ ...prev, [categoryId]: "" }));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add subcategory!");
    } finally {
      setAddingSub((prev) => ({ ...prev, [categoryId]: false }));
    }
  };

  // Delete subcategory
  const deleteSubcategory = async (categoryId, subcategoryName) => {
    if (!window.confirm(`Delete subcategory "${subcategoryName}"?`)) return;
    try {
      await axios.delete(
        `${API_URL}/${categoryId}/subcategories/${subcategoryName}`
      );
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === categoryId
            ? {
                ...cat,
                subcategories: cat.subcategories.filter(
                  (sc) => sc.name !== subcategoryName
                ),
              }
            : cat
        )
      );
    } catch (err) {
      alert("Failed to delete subcategory!");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Manage Categories</h1>
        {loading && (
          <span className="text-sm text-gray-500 animate-pulse">
            Fetching categories...
          </span>
        )}
      </div>

      {/* Add Category Input */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Enter new category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-gray-300 p-3 rounded-lg flex-1 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <button
          onClick={addCategory}
          disabled={adding}
          className={`px-5 py-2.5 rounded-lg text-white font-medium shadow transition 
            ${adding ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
        >
          {adding ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {categories.length === 0 ? (
          <p className="text-gray-500 text-center py-6">
            {loading ? "Loading..." : "No categories added yet."}
          </p>
        ) : (
          <ul>
            {categories.map((c) => (
              <li
                key={c._id}
                className="px-4 py-3 border-b last:border-none hover:bg-gray-50 transition"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-medium">{c.name}</span>
                  <button
                    onClick={() => deleteCategory(c._id)}
                    className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                  >
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
                {/* Subcategories */}
                <div className="ml-4 mt-2">
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
                        addingSub[c._id]
                          ? "bg-gray-400"
                          : "bg-green-600 hover:bg-green-700"
                      }`}
                    >
                      {addingSub[c._id] ? "Adding..." : "Add"}
                    </button>
                  </div>
                  {c.subcategories && c.subcategories.length > 0 && (
                    <ul className="ml-2">
                      {c.subcategories.map((sc, idx) => (
                        <li key={idx} className="flex items-center gap-2 mb-1">
                          <span className="text-gray-700">{sc.name}</span>
                          <button
                            onClick={() => deleteSubcategory(c._id, sc.name)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Remove
                          </button>
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
