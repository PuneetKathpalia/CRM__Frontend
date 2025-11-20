import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL as API_BASE } from '../config/api';
import { FiSearch, FiEdit2, FiTrash2, FiEye, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import toast from 'react-hot-toast';
import { TableRowSkeleton } from '../components/LoadingSkeleton';

const CustomerDirectory = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/customers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch customers");
        const data = await res.json();
        const customersList = data.data || data;
        setCustomers(customersList);
        setFilteredCustomers(customersList);
      } catch (err) {
        console.error("❌ Failed to fetch customers:", err);
        toast.error("Failed to load customers");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  // Get unique tags from all customers
  const allTags = Array.from(new Set(customers.flatMap(c => c.tags || []))).filter(Boolean);

  // Filter and sort customers
  useEffect(() => {
    let filtered = [...customers];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(customer =>
        customer.name?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query)
      );
    }

    // Apply tag filter
    if (selectedTag) {
      filtered = filtered.filter(customer =>
        customer.tags?.includes(selectedTag)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "latest":
        filtered.sort((a, b) => new Date(b.createdAt || b._id) - new Date(a.createdAt || a._id));
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt || a._id) - new Date(b.createdAt || b._id));
        break;
      case "highestSpend":
        filtered.sort((a, b) => (b.totalSpend || 0) - (a.totalSpend || 0));
        break;
      case "mostVisits":
        filtered.sort((a, b) => (b.visits || 0) - (a.visits || 0));
        break;
      default:
        break;
    }

    setFilteredCustomers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [customers, searchQuery, selectedTag, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete customer");

      setCustomers(prev => prev.filter(c => c._id !== id));
      toast.success("Customer deleted successfully!");
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error("Failed to delete customer");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-white">
          Customer Directory
        </h1>

        {/* Search and Filters */}
        <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tag Filter */}
            <div>
              <select
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="latest">Latest Added</option>
                <option value="oldest">Oldest</option>
                <option value="highestSpend">Highest Spend</option>
                <option value="mostVisits">Most Visits</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-gray-400">
          Showing {paginatedCustomers.length} of {filteredCustomers.length} customers
        </div>

        {/* Customers Table */}
        <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10">
          {loading ? (
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Phone</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Total Spend</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Visits</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tags</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-white/10">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={7} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : paginatedCustomers.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-lg">No customers found</p>
              <p className="text-sm mt-2">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-black border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Total Spend</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Visits</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Tags</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-black divide-y divide-white/10">
                    {paginatedCustomers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap text-white text-base font-semibold">{customer.name}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-gray-300 text-base">{customer.email}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-gray-300 text-base">{customer.phone || "-"}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-white text-base font-semibold">₹{customer.totalSpend || 0}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-white text-base font-semibold">{customer.visits || 0}</td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm">
                          <div className="flex flex-wrap gap-2">
                            {customer.tags?.length > 0 ? (
                              customer.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 font-semibold border border-purple-500/30"
                                >
                                  {tag}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right text-base font-medium">
                          <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => navigate(`/customers/${customer._id}`)}
                              className="text-blue-400 hover:text-blue-300 transition-colors p-2.5 hover:bg-blue-500/10 rounded-xl"
                              title="View"
                            >
                              <FiEye size={20} />
                            </button>
                            <button
                              onClick={() => navigate(`/customers/${customer._id}?edit=true`)}
                              className="text-green-400 hover:text-green-300 transition-colors p-2.5 hover:bg-green-500/10 rounded-xl"
                              title="Edit"
                            >
                              <FiEdit2 size={20} />
                            </button>
                            <button
                              onClick={() => handleDelete(customer._id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-2.5 hover:bg-red-500/10 rounded-xl"
                              title="Delete"
                            >
                              <FiTrash2 size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
                  <div className="text-gray-400 text-sm">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-black border border-white/10 text-white rounded-xl hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      <FiChevronLeft /> Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-black border border-white/10 text-white rounded-xl hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDirectory;







