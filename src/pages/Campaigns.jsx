import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from '../config/api';
import { FiTrash2, FiEdit2, FiSave, FiX, FiPlusCircle, FiMessageSquare } from "react-icons/fi";
import toast from 'react-hot-toast';
import { TableRowSkeleton } from '../components/LoadingSkeleton';

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [segmentLoading, setSegmentLoading] = useState(true);
  const [campaignName, setCampaignName] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("");
  const [message, setMessage] = useState("");
  
  // Edit state
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setSegmentLoading(true);
        const segmentsRes = await fetch(`${API_BASE}/api/segments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!segmentsRes.ok) {
          throw new Error("Failed to fetch segments");
        }
        
        const segmentsData = await segmentsRes.json();
        setSegments(segmentsData.data || segmentsData);
      } catch (err) {
        console.error("Failed to fetch segments:", err);
        toast.error("Failed to load segments. Please refresh the page.");
      } finally {
        setSegmentLoading(false);
      }
    };

    if (token) {
      fetchSegments();
    }
  }, [token]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        setLoading(true);
        const campaignsRes = await fetch(`${API_BASE}/api/campaigns`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (!campaignsRes.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData.data || campaignsData);
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
        toast.error("Failed to load campaigns. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCampaigns();
    }
  }, [token]);

  const handleCreateCampaign = async () => {
    if (!campaignName || !selectedSegment || !message) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/campaigns`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: campaignName,
          segmentId: selectedSegment,
          message,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }
      
      const data = await res.json();
      const newCampaign = data.data || data;
      const segment = segments.find(s => s._id === selectedSegment);
      newCampaign.segmentId = segment;
      
      setCampaigns([newCampaign, ...campaigns]);
      setCampaignName("");
      setSelectedSegment("");
      setMessage("");
      toast.success("Campaign created successfully!");
    } catch (err) {
      console.error("Error creating campaign:", err);
      toast.error(err.message || "Failed to create campaign. Please try again.");
    }
  };

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    setCampaignName(campaign.name);
    setSelectedSegment(campaign.segmentId?._id || campaign.segmentId || "");
    setMessage(campaign.message);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!campaignName || !selectedSegment || !message) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/campaigns/${editingCampaign._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: campaignName,
          segmentId: selectedSegment,
          message,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update campaign");
      }

      const data = await res.json();
      const updatedCampaign = data.data || data;
      const segment = segments.find(s => s._id === selectedSegment);
      updatedCampaign.segmentId = segment;

      setCampaigns(prev => prev.map(c => c._id === updatedCampaign._id ? updatedCampaign : c));
      setIsEditModalOpen(false);
      setEditingCampaign(null);
      setCampaignName("");
      setSelectedSegment("");
      setMessage("");
      toast.success("Campaign updated successfully!");
    } catch (err) {
      console.error("Error updating campaign:", err);
      toast.error(err.message || "Failed to update campaign. Please try again.");
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    
    try {
      const res = await fetch(`${API_BASE}/api/campaigns/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete campaign");
      }

      setCampaigns(prev => prev.filter(campaign => campaign._id !== id));
      toast.success("Campaign deleted successfully!");
    } catch (err) {
      console.error("Error deleting campaign:", err);
      toast.error(err.message || "Failed to delete campaign");
    }
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingCampaign(null);
    setCampaignName("");
    setSelectedSegment("");
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-white flex items-center gap-4">
          <FiMessageSquare className="text-purple-400" /> Campaigns
        </h1>

        {/* Create New Campaign Form */}
        <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10 mb-10">
          <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
            <FiPlusCircle className="text-green-400" /> {editingCampaign ? 'Edit Campaign' : 'Create New Campaign'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-3 text-sm font-semibold text-white">Campaign Name</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                placeholder="Enter campaign name"
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-3 text-sm font-semibold text-white">Select Segment</label>
              <select
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                value={selectedSegment}
                onChange={(e) => setSelectedSegment(e.target.value)}
                disabled={segmentLoading}
              >
                <option value="">-- Select a Segment --</option>
                {segmentLoading ? (
                  <option value="" disabled>Loading segments...</option>
                ) : segments.length === 0 ? (
                  <option value="" disabled>No segments available</option>
                ) : (
                  segments.map((segment) => (
                    <option key={segment._id} value={segment._id}>
                      {segment.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <label className="block mb-3 text-sm font-semibold text-white">Message</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 h-40 resize-y text-base"
              placeholder="Enter your campaign message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 mt-8">
            {editingCampaign ? (
              <>
                <button
                  onClick={closeEditModal}
                  className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-2xl shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex items-center justify-center gap-3 text-base hover:scale-[1.02] transition-all"
                >
                  <FiSave className="w-5 h-5" /> Update Campaign
                </button>
              </>
            ) : (
              <button
                onClick={handleCreateCampaign}
                className="flex-1 px-8 py-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 text-white font-bold rounded-xl shadow-2xl shadow-purple-500/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 flex items-center justify-center gap-3 text-base hover:scale-[1.02] transition-all"
              >
                <FiPlusCircle className="w-5 h-5" /> Create Campaign
              </button>
            )}
          </div>
        </div>

        {/* Existing Campaigns List */}
        <div className="bg-black border border-white/10 rounded-2xl shadow-2xl p-10">
          <h2 className="text-3xl font-bold mb-8 text-white flex items-center gap-3">
            <FiMessageSquare className="text-blue-400" /> Existing Campaigns
          </h2>
          {loading ? (
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Segment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-white/10">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={6} />
                  ))}
                </tbody>
              </table>
            </div>
          ) : campaigns.length === 0 ? (
            <p className="text-center py-12 text-gray-400 text-lg">No campaigns found. Create your first campaign above!</p>
          ) : (
            <div className="overflow-x-auto rounded-xl">
              <table className="min-w-full divide-y divide-white/10">
                <thead className="bg-black border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Campaign Name</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Segment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Message</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Created</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-white uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-white/10">
                  {campaigns.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-5 whitespace-nowrap text-white text-base font-semibold">{campaign.name}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-gray-300 text-base">{campaign.segmentId?.name || 'N/A'}</td>
                      <td className="px-6 py-5 max-w-xs truncate text-gray-300 text-base">{campaign.message}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-gray-300 text-base">{new Date(campaign.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-base">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                          campaign.status === 'launched' 
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                        }`}>
                          {campaign.status || 'draft'}
                        </span>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap text-right text-base font-medium">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleEdit(campaign)}
                            className="text-blue-400 hover:text-blue-300 transition-colors p-2.5 hover:bg-blue-500/10 rounded-xl"
                            title="Edit Campaign"
                          >
                            <FiEdit2 size={20} />
                          </button>
                          <button
                            onClick={() => handleDeleteCampaign(campaign._id)}
                            className="text-red-400 hover:text-red-300 transition-colors p-2.5 hover:bg-red-500/10 rounded-xl"
                            title="Delete Campaign"
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
    </div>
  );
};

export default Campaigns;
