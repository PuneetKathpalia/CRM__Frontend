import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL as API_BASE } from '../config/api';
import { 
  FiUser, FiMail, FiPhone, FiDollarSign, FiTrendingUp, FiTag, 
  FiArrowLeft, FiPlus, FiClock, FiFileText, FiActivity
} from "react-icons/fi";

const CustomerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [noteContent, setNoteContent] = useState("");
  const [isAddingNote, setIsAddingNote] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchCustomerData();
  }, [id, token]);

  const fetchCustomerData = async () => {
    try {
      const [customerRes, notesRes, activitiesRes] = await Promise.all([
        fetch(`${API_BASE}/api/customers/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/customers/${id}/notes`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_BASE}/api/customers/${id}/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!customerRes.ok) throw new Error("Failed to fetch customer");
      if (!notesRes.ok) throw new Error("Failed to fetch notes");
      if (!activitiesRes.ok) throw new Error("Failed to fetch activities");

      const customerData = await customerRes.json();
      const notesData = await notesRes.json();
      const activitiesData = await activitiesRes.json();

      setCustomer(customerData.data || customerData);
      setNotes(notesData.data || notesData);
      setActivities(activitiesData.data || activitiesData);
    } catch (err) {
      console.error("Error fetching customer data:", err);
      alert("Failed to load customer data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      alert("Please enter a note");
      return;
    }

    setIsAddingNote(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/${id}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: noteContent }),
      });

      if (!res.ok) throw new Error("Failed to add note");

      const data = await res.json();
      setNotes(prev => [data.data || data, ...prev]);
      setNoteContent("");
      await fetchCustomerData(); // Refresh activities
    } catch (err) {
      console.error("Error adding note:", err);
      alert("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-6 text-white text-lg">Loading customer profile...</p>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xl text-gray-400">Customer not found</p>
          <button
            onClick={() => navigate("/customers")}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all"
          >
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/customers")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <FiArrowLeft className="w-5 h-5" />
            <span>Back to Customers</span>
          </button>
          <h1 className="text-5xl font-extrabold mb-2 text-white">
            👤 {customer.name}
          </h1>
        </div>

        {/* Customer Details Card */}
        <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10 mb-10">
          <h2 className="text-3xl font-bold mb-8 text-white">Customer Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                <FiMail className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white text-lg font-semibold">{customer.email}</p>
              </div>
            </div>

            {customer.phone && (
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                  <FiPhone className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Phone</p>
                  <p className="text-white text-lg font-semibold">{customer.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                <FiDollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Spend</p>
                <p className="text-white text-lg font-semibold">₹{customer.totalSpend || 0}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl">
                <FiTrendingUp className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Visits</p>
                <p className="text-white text-lg font-semibold">{customer.visits || 0}</p>
              </div>
            </div>

            {customer.tags && customer.tags.length > 0 && (
              <div className="md:col-span-2">
                <p className="text-sm text-gray-400 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {customer.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-xs rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 font-semibold border border-purple-500/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Notes Section */}
          <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                <FiFileText className="w-8 h-8 text-purple-400" />
                Notes
              </h2>
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-8">
              <div className="mb-4">
                <textarea
                  className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base resize-none"
                  placeholder="Add a note about this customer..."
                  rows="3"
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={isAddingNote}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
              >
                <FiPlus className="w-5 h-5" />
                {isAddingNote ? "Adding..." : "Add Note"}
              </button>
            </form>

            {/* Notes List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notes.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No notes yet. Add your first note above!</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note._id}
                    className="p-6 bg-black border border-white/10 rounded-xl hover:border-purple-500/50 transition-all"
                  >
                    <p className="text-white mb-3 whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <FiClock className="w-4 h-4" />
                      <span>{formatDate(note.createdAt)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10">
            <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
              <FiActivity className="w-8 h-8 text-purple-400" />
              Activity Timeline
            </h2>

            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {activities.length === 0 ? (
                <p className="text-center text-gray-400 py-8">No activity yet.</p>
              ) : (
                activities.map((activity, index) => (
                  <div key={activity._id} className="relative pl-8 border-l-2 border-purple-500/30">
                    {index !== activities.length - 1 && (
                      <div className="absolute left-[-6px] top-8 w-2 h-full bg-black"></div>
                    )}
                    <div className="absolute left-[-10px] top-0 w-4 h-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full border-2 border-black"></div>
                    <div className="bg-black border border-white/10 rounded-xl p-6 hover:border-purple-500/50 transition-all">
                      <p className="text-white mb-2">{activity.description}</p>
                      <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <FiClock className="w-4 h-4" />
                        <span>{formatDate(activity.createdAt)}</span>
                        <span className="px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;

