import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL as API_BASE } from '../config/api';
import { FiUser, FiMail, FiPhone, FiDollarSign, FiTrendingUp, FiTag, FiSave, FiTrash2, FiMessageSquare, FiEdit2, FiX, FiArrowDown } from "react-icons/fi";
import toast from 'react-hot-toast';
import { TableRowSkeleton } from '../components/LoadingSkeleton';

const Customers = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [totalSpend, setTotalSpend] = useState("");
  const [visits, setVisits] = useState("");
  const [tags, setTags] = useState("");

  // Edit state
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [campaignGoal, setCampaignGoal] = useState("");
  const [generatedMessages, setGeneratedMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for scroll indicator
  const [showScrollIndicator, setShowScrollIndicator] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const fetchCustomers = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/customers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch customers");
        }

        const data = await res.json();
        // Handle both old and new response formats
        setCustomers(data.data || data);
      } catch (err) {
        console.error("❌ Failed to fetch customers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [token]);

  // Effect and handler for scroll indicator
  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10; // -10 for a small buffer
      setShowScrollIndicator(!isAtBottom && document.body.offsetHeight > window.innerHeight);
    };

    window.addEventListener('scroll', handleScroll);
    // Initial check
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []); // Re-run if dependencies change, none needed here for basic scroll

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setTotalSpend("");
    setVisits("");
    setTags("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      return;
    }
    if (!name || !email) {
      toast.error("Name and Email are required fields.");
      return;
    }

    try {
      const customerData = {
        name,
        email,
        phone,
        totalSpend: parseFloat(totalSpend) || 0,
        visits: parseInt(visits) || 0,
        tags: tags ? (typeof tags === 'string' ? tags.split(",").map((tag) => tag.trim()).filter(tag => tag !== '') : Array.isArray(tags) ? tags : []) : [],
      };

      const res = await fetch(`${API_BASE}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to save customer");
      }
      
      const newCustomer = data.data || data;
      setCustomers(prev => [...prev, newCustomer]);
      toast.success("Customer added successfully!");
      resetForm();
    } catch (err) {
      console.error("Error saving customer:", err);
      toast.error(`Failed to save customer: ${err.message}`);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setName(customer.name);
    setEmail(customer.email);
    setPhone(customer.phone || "");
    setTotalSpend(customer.totalSpend || "");
    setVisits(customer.visits || "");
    setTags(customer.tags?.join(", ") || "");
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Authentication token not found. Please log in.");
      return;
    }
    if (!name || !email) {
      toast.error("Name and Email are required fields.");
      return;
    }

    try {
      const customerData = {
        name,
        email,
        phone,
        totalSpend: parseFloat(totalSpend) || 0,
        visits: parseInt(visits) || 0,
        tags: tags ? (typeof tags === 'string' ? tags.split(",").map((tag) => tag.trim()).filter(tag => tag !== '') : Array.isArray(tags) ? tags : []) : [],
      };

      const res = await fetch(`${API_BASE}/api/customers/${editingCustomer._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(customerData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || "Failed to update customer");
      }

      const updatedCustomer = data.data || data;
      setCustomers(prev => prev.map(c => c._id === updatedCustomer._id ? updatedCustomer : c));
      toast.success("Customer updated successfully!");
      setIsEditModalOpen(false);
      setEditingCustomer(null);
      resetForm();
    } catch (err) {
      console.error("Error updating customer:", err);
      toast.error(`Failed to update customer: ${err.message}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete customer");
      }

      setCustomers(prev => prev.filter(c => c._id !== id));
      toast.success("Customer deleted successfully!");
    } catch (err) {
      console.error("Error deleting customer:", err);
      toast.error(`Failed to delete customer: ${err.message}`);
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCustomer(null);
    resetForm();
  };

  const generateMessages = async () => {
    if (!selectedCustomer || !campaignGoal) {
      toast.error("Please select a customer and enter a campaign goal");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE}/api/generate-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customer: selectedCustomer,
          goal: campaignGoal,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || "Failed to generate messages";
        throw new Error(errorMessage);
      }

      // Handle both old and new response formats
      const messages = data.data?.messages || data.messages || [];
      
      if (!messages || messages.length === 0) {
        throw new Error("No messages were generated. Please try again.");
      }

      setGeneratedMessages(messages);
      toast.success("Messages generated successfully!");
    } catch (err) {
      console.error("Error generating messages:", err);
      toast.error(err.message || "Failed to generate messages. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-white text-center">
          👥 Customers
        </h1>

        {/* Add Customer Form */}
        <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10 mb-10">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">
            Add New Customer
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Input Fields */}
              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  <FiUser className="inline mr-2" /> Name *
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                  placeholder="Enter customer name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  <FiMail className="inline mr-2" /> Email *
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                  placeholder="Enter email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  <FiPhone className="inline mr-2" /> Phone
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  <FiDollarSign className="inline mr-2" /> Total Spend
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                  placeholder="0.00"
                  value={totalSpend}
                  onChange={(e) => setTotalSpend(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  <FiTrendingUp className="inline mr-2" /> Total Visits
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                  placeholder="0"
                  value={visits}
                  onChange={(e) => setVisits(e.target.value)}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-white">
                  <FiTag className="inline mr-2" /> Tags
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                  placeholder="vip, regular, new"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-center mt-8">
              <button
                type="submit"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex items-center justify-center gap-3 font-bold text-base shadow-2xl shadow-purple-500/30"
              >
                <FiSave className="w-5 h-5" /> Save Customer
              </button>
            </div>
          </form>
        </div>

        {/* Smart Message Generator Panel */}
        <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10 mb-10">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">
            <FiMessageSquare className="inline mr-3" /> Smart Message Generator
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="block mb-2 text-sm font-semibold text-white">
                Select Customer
              </label>
                <select
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                value={selectedCustomer?._id || ""}
                onChange={(e) => {
                  const customer = customers.find(c => c._id === e.target.value);
                  setSelectedCustomer(customer);
                }}
              >
                <option value="">Select a customer...</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} ({customer.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="campaign-goal-input" className="block mb-2 text-sm font-semibold text-white">
                Campaign Goal
              </label>
              <input
                type="text"
                id="campaign-goal-input"
                name="campaignGoal"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                placeholder="e.g., win back inactive users, promote new product"
                value={campaignGoal}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setCampaignGoal(newValue);
                }}
                onKeyDown={(e) => {
                  // Allow all key inputs
                  e.stopPropagation();
                }}
                onClick={(e) => {
                  e.stopPropagation();
                }}
                autoComplete="off"
                tabIndex={0}
                style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
              />
            </div>

            <button
              onClick={generateMessages}
              disabled={isGenerating || !selectedCustomer || !campaignGoal}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-2xl shadow-purple-500/30 text-base"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </>
              ) : (
                "Generate Messages"
              )}
            </button>

            {generatedMessages.length > 0 && (
              <div className="mt-10 space-y-6">
                <h3 className="text-3xl font-bold text-white pb-6">Generated Messages:</h3>
                {generatedMessages.map((message, index) => (
                  <div
                    key={index}
                    className="p-8 bg-black border border-white/10 rounded-2xl shadow-xl transition-all duration-300 hover:border-purple-500/50 hover:shadow-purple-500/20 space-y-4"
                  >
                    {/* Subject */}
                    <div>
                      <p className="text-purple-400 font-bold text-xl border-b border-white/10 pb-4 mb-4">{message.subject}</p>
                    </div>
                    {/* Body */}
                    <div>
                      <p className="text-gray-300 whitespace-pre-wrap text-base leading-relaxed">{message.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold mb-8 text-white text-center">📋 Customer List</h2>
          
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
          ) : customers.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-lg">No customers found. Add your first customer above!</p>
          ) : (
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
                  {customers.map((customer) => (
                    <tr 
                      key={customer._id} 
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => navigate(`/customers/${customer._id}`)}
                    >
                      <td className="px-6 py-5 whitespace-nowrap text-white text-base font-semibold">{customer.name}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-gray-300 text-base">{customer.email}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-gray-300 text-base">{customer.phone || "-"}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-white text-base font-semibold">₹{customer.totalSpend || 0}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-white text-base font-semibold">{customer.visits || 0}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-sm">
                        <div className="flex flex-wrap gap-2">
                          {customer.tags?.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 font-semibold border border-purple-500/30"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-base font-medium">
                        <div className="flex items-center justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="text-blue-400 hover:text-blue-300 transition-colors p-2.5 hover:bg-blue-500/10 rounded-xl"
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
          )}
        </div>
      </div>

      {/* Scroll Down Indicator */}
      {showScrollIndicator && (
        <div 
          className="fixed bottom-8 right-8 bg-gradient-to-r from-purple-600 to-blue-600 p-3 rounded-full cursor-pointer shadow-lg shadow-purple-500/50 transition-opacity duration-300 hover:scale-110 animate-bounce"
          onClick={scrollToBottom}
          title="Scroll Down"
        >
          <FiArrowDown size={24} className="text-white" />
        </div>
      )}

      {/* Edit Customer Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-black border border-white/20 rounded-3xl shadow-2xl p-10 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white">Edit Customer</h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                    <FiUser className="inline mr-2" /> Name *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                    placeholder="Customer name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                    <FiMail className="inline mr-2" /> Email *
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                    placeholder="Customer email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                    <FiPhone className="inline mr-2" /> Phone
                  </label>
                  <input
                    type="tel"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                    placeholder="Phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                    <FiDollarSign className="inline mr-2" /> Total Spend
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                    placeholder="0.00"
                    value={totalSpend}
                    onChange={(e) => setTotalSpend(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                    <FiTrendingUp className="inline mr-2" /> Total Visits
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                    placeholder="0"
                    value={visits}
                    onChange={(e) => setVisits(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-300">
                    <FiTag className="inline mr-2" /> Tags
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                    placeholder="vip, regular, new"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white rounded-xl hover:from-purple-700 hover:via-blue-700 hover:to-cyan-600 transition-all duration-300 flex items-center gap-3 font-bold shadow-2xl shadow-purple-500/30 text-base"
                >
                  <FiSave /> Update Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
