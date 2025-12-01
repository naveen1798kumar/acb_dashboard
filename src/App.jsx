// dashboard/src/App.jsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  Link,
} from "react-router-dom";
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

import { motion } from "framer-motion";

import Products from "./pages/Products";
import AddProduct from "./pages/AddProduct";
import ProductDetails from "./pages/ProductDetails";
import Categories from "./pages/Categories";
import Events from "./pages/Events";
import EventManager from "./pages/EventManager";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Login from "./pages/Login";
// import Users from "./pages/Users.jsx";
import UsersPage from "./pages/UsersPage.jsx";
import PrivateRoute from "./components/PrivateRoute";
import UserOrders from "./pages/UserOrders";

// Adjust these paths to match your assets
import logo from "./assets/acb-logo-png.png"; // main logo
import acblogo from "./assets/acb-logo.png"; // text logo (you can swap later)

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const menuItems = [
    { to: "/", label: "Products", icon: <FiBox size={18} /> },
    { to: "/add", label: "Add Product", icon: <FiPlus size={18} /> },
    { to: "/categories", label: "Categories", icon: <FiTag size={18} /> },
    { to: "/events", label: "Events", icon: <FiGift size={18} /> },
    { to: "/orders", label: "Orders", icon: <FiFileText size={18} /> },
    { to: "/users", label: "Users", icon: <FiUsers size={18} /> },
  ];

  const getPageTitle = () => {
    const path = location.pathname;

    const found = menuItems.find((item) =>
      item.to === "/"
        ? path === "/"
        : path === item.to || path.startsWith(item.to + "/")
    );
    if (found) return found.label;

    if (path.startsWith("/orders/")) return "Order Details";
    if (path.startsWith("/users/") && path.endsWith("/orders"))
      return "User Orders";

    return "Dashboard";
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      {/* SIDEBAR */}
      <aside
        className={`
          relative z-20
          bg-slate-950
          text-slate-100
          border-r border-slate-800/80
          shadow-xl
          transition-all duration-300 ease-out
          ${collapsed ? "w-20" : "w-72"}
        `}
      >
        {/* Gradient Glow Background */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(248,113,113,0.35),_transparent_60%),_radial-gradient(circle_at_bottom,_rgba(59,130,246,0.22),_transparent_60%)] opacity-60" />

        {/* Sidebar Header (no logo image here now) */}
        <div className="relative h-18 px-4 py-3 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            {!collapsed && (<div className="h-9 w-9 rounded-2xl bg-gradient-to-tr from-red-500 to-rose-500 flex items-center justify-center text-xs font-semibold shadow-lg shadow-red-500/40">
              ACB
            </div>)}
            {!collapsed && (
              <div className="leading-tight">
                <p className="text-sm font-semibold text-slate-50">
                  Admin Panel
                </p>
                <p className="text-[11px] text-slate-400">acb bakery</p>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="relative inline-flex items-center justify-center h-8 w-8 rounded-xl border border-slate-700/70 bg-slate-900/80 hover:bg-slate-800 transition"
          >
            {collapsed ? <FiMenu size={18} /> : <FiX size={18} />}
          </button>
        </div>

        {/* Nav Items */}
        <nav className="relative mt-4 space-y-1 px-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                [
                  "group flex items-center gap-3 mx-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-red-500 via-rose-500 to-amber-400 text-white shadow-md shadow-red-500/40 border border-red-300/80"
                    : "text-slate-200/90 hover:bg-slate-800/80 hover:text-white border border-transparent",
                  collapsed ? "justify-center" : "",
                ].join(" ")
              }
            >
              <span className="shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom strip */}
        <div className="relative mt-auto h-12 w-full flex items-center px-4 pb-4">
          {!collapsed && (
            <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow shadow-emerald-400/60" />
                <span>Admin online</span>
              </span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col">
        {/* TOP BAR */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-slate-200/80">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="md:hidden inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-100 bg-white"
              >
                <FiMenu size={18} />
              </button>

              {/* Logo + Title in TOPBAR */}
              <div className="flex items-center gap-3">
                <Link
                  to="/"
                  className="relative flex items-center gap-3 group"
                >
                  {/* Icon logo in topbar */}
                  <motion.div
                    className="relative flex items-center justify-center"
                    whileHover={{ scale: 1.04, rotate: [-1, 1, 0] }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="absolute inset-0 rounded-2xl bg-red-500/20 blur-md opacity-70 group-hover:opacity-90 transition" />
                    <img
                      src={logo}
                      alt="ACB Logo"
                      className="relative h-9 w-9 md:h-10 md:w-10 rounded-2xl border border-red-400/40 bg-white object-contain shadow-md shadow-red-400/40"
                    />
                  </motion.div>

                  <div className="hidden sm:flex flex-col">
                    <div className="relative">
                      <img
                        src={acblogo}
                        alt="ACB Text Logo"
                        className="h-6 md:h-7 w-auto object-contain drop-shadow-sm"
                      />
                    </div>
                    <p className="text-[11px] pacifico-regular text-amber-700 font-medium mt-0.5">
                      Love in every bite
                    </p>
                  </div>
                </Link>

                {/* Page Title */}
                <div className="flex flex-col ml-1 sm:ml-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                    ACB Admin
                  </p>
                  <h2 className="text-lg md:text-xl font-semibold text-slate-900 flex items-center gap-2">
                    {getPageTitle()}
                    <span className="hidden sm:inline-flex text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                      Bakery Dashboard
                    </span>
                  </h2>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
          <div className="relative mt-auto h-12 w-full flex items-center px-4 pb-4">
          {!collapsed && (
            <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow shadow-emerald-400/60" />
                <span>Admin online</span>
              </span>
            </div>
          )}
        </div>
              {/* Admin Chip */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-red-500 to-rose-500 text-xs font-semibold text-white flex items-center justify-center">
                  A
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-[11px] font-medium text-slate-800">
                    Admin
                  </span>
                  <span className="text-[10px] text-slate-500">
                    acb bakery
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 bg-red-500 text-white text-sm font-medium px-3 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-red-600 shadow-sm hover:shadow-md shadow-red-500/30 transition"
              >
                <FiLogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* MAIN ROUTES */}
        <main className="flex-1 p-4 md:p-6">
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
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id/orders" element={<UserOrders />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
