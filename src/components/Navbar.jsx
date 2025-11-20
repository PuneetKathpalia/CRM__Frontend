import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { FiHome, FiUsers, FiLayers, FiMail, FiLogOut, FiTrendingUp } from "react-icons/fi";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-black border-b border-white/10 sticky top-0 z-50 backdrop-blur-xl bg-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
              <FiTrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">
              MiniCRM
            </span>
          </Link>

          {/* Navigation and User Info */}
          {user && (
            <div className="flex items-center gap-6">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center gap-2">
                <NavLink to="/dashboard" active={isActive("/dashboard")}>
                  <FiHome className="w-4 h-4" />
                  Dashboard
                </NavLink>
                <NavLink to="/customers" active={isActive("/customers")}>
                  <FiUsers className="w-4 h-4" />
                  Customers
                </NavLink>
                <NavLink to="/customer-directory" active={isActive("/customer-directory")}>
                  <FiUsers className="w-4 h-4" />
                  Customer Directory
                </NavLink>
                <NavLink to="/segments" active={isActive("/segments")}>
                  <FiLayers className="w-4 h-4" />
                  Segments
                </NavLink>
                <NavLink to="/campaigns" active={isActive("/campaigns")}>
                  <FiMail className="w-4 h-4" />
                  Campaigns
                </NavLink>
              </div>

              {/* User Info and Logout */}
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black/50 border border-white/10 rounded-xl">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-white">
                    {user.name || user.email}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-red-500/20 text-sm font-semibold"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
      active
        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`}
  >
    {children}
  </Link>
);

export default Navbar;
