import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";

import {
  FiBox,
  FiPlus,
  FiTag,
  FiGift,
  FiFileText,
  FiUsers,
  FiMenu,
  FiX,
  FiLogOut,
} from "react-icons/fi";

import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Events from "./pages/Events";
import EventManager from "./pages/EventManager";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Users from "./pages/users";
import Login from "./pages/Login";
import PrivateRoute from "./components/PrivateRoute";
import UserOrders from "./pages/UserOrders";

export default function App() {
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const menuItems = [
    { to: "/", label: "Products", icon: <FiBox /> },
    { to: "/add", label: "Add Product", icon: <FiPlus /> },
    { to: "/categories", label: "Categories", icon: <FiTag /> },
    { to: "/events", label: "Events", icon: <FiGift /> },
    { to: "/orders", label: "Orders", icon: <FiFileText /> },
    { to: "/users", label: "Users", icon: <FiUsers /> },
  ];

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <PrivateRoute>
              <div className="flex min-h-screen bg-gray-100">

                {/* SIDEBAR */}
                <aside
                  className={`bg-white shadow-lg transition-all duration-300 border-r 
                    ${collapsed ? "w-20" : "w-64"}`}
                >
                  {/* Logo + Toggle */}
                  <div className="p-5 flex items-center justify-between border-b">
                    {!collapsed && (
                      <h1 className="text-2xl font-bold text-red-600">ACB</h1>
                    )}

                    <button
                      onClick={() => setCollapsed(!collapsed)}
                      className="p-2 rounded-md hover:bg-gray-200"
                    >
                      {collapsed ? <FiMenu size={20} /> : <FiX size={20} />}
                    </button>
                  </div>

                  {/* Nav Items */}
                  <nav className="mt-4 space-y-1">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-5 py-3 rounded-lg mx-3 
                           transition-all font-medium
                           ${
                             isActive
                               ? "bg-red-600 text-white shadow-md"
                               : "text-gray-700 hover:bg-gray-100"
                           }`
                        }
                      >
                        <span>{item.icon}</span>
                        {!collapsed && <span>{item.label}</span>}
                      </NavLink>
                    ))}
                  </nav>
                </aside>

                {/* MAIN CONTENT */}
                <div className="flex-1 flex flex-col">
                  {/* HEADER */}
                  <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-800">Admin Panel</h2>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      <FiLogOut /> Logout
                    </button>
                  </header>

                  <main className="flex-1 p-6">
                    <Routes>
                      <Route path="/" element={<Products />} />
                      <Route path="/add" element={<AddProduct />} />
                      <Route path="/product/:id" element={<ProductDetails />} />
                      <Route path="/edit/:id" element={<AddProduct />} />
                      <Route path="/categories" element={<Categories />} />
                      <Route path="/events" element={<Events />} />
                      <Route path="/events/:id/manage" element={<EventManager />} />
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderDetails />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/users/:id/orders" element={<UserOrders />} />
                    </Routes>
                  </main>

                </div>
              </div>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
