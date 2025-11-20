import { useState, useEffect } from "react";
import { API_BASE_URL as API_BASE } from '../config/api';
import toast from 'react-hot-toast';

const Segments = () => {
  const [segmentName, setSegmentName] = useState("");
  const [rules, setRules] = useState({
    totalSpend: { operator: "gt", value: 5000 },
    visits: { operator: "lt", value: 3 },
    inactiveDays: 90,
  });
  const [segments, setSegments] = useState([]);
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/segments`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch segments");
        const data = await res.json();
        setSegments(data.data || data);
      } catch (err) {
        console.error("Error fetching segments:", err);
        toast.error("Failed to load segments.");
      }
    };

    if (token) {
      fetchSegments();
    }
  }, [token]);

  const handlePreview = async () => {
    try {
      setIsPreviewLoading(true);
      const res = await fetch(`${API_BASE}/api/segments/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rules }),
      });
      const data = await res.json();
      setPreview(data.data || data);
    } catch (error) {
      console.error("Preview failed:", error);
      toast.error("Failed to preview segment. Please try again.");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!segmentName.trim()) {
      toast.error("Please enter a segment name");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/segments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: segmentName, rules }),
      });
      
      if (!res.ok) {
        throw new Error("Failed to create segment");
      }
      
      const data = await res.json();
      const newSegment = data.data || data;
      setSegments(prev => [...prev, newSegment]);
      toast.success("Segment created successfully!");
      setSegmentName("");
      setRules({
        totalSpend: { operator: "gt", value: 5000 },
        visits: { operator: "lt", value: 3 },
        inactiveDays: 90,
      });
      setPreview(null);
    } catch (error) {
      console.error("Creation failed:", error);
      toast.error("Failed to create segment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSegment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this segment?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/segments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error("Failed to delete segment");
      }

      setSegments(prev => prev.filter(segment => segment._id !== id));
      toast.success("Segment deleted successfully!");
    } catch (err) {
      console.error("Error deleting segment:", err);
      toast.error(`Failed to delete segment: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-10 text-white">
          🎯 Create Segment
        </h1>

        <div className="bg-black border border-white/10 rounded-2xl p-10 mb-10 shadow-xl">
          <h2 className="text-3xl font-bold mb-8 text-white">📊 Existing Segments</h2>
          {segments.length === 0 ? (
            <p className="text-gray-400 text-lg">No segments created yet.</p>
          ) : (
            <ul className="space-y-3">
              {segments.map((segment) => (
                <li key={segment._id} className="flex justify-between items-center bg-black border border-white/10 p-4 rounded-xl">
                  <span className="text-white font-semibold text-base">{segment.name}</span>
                  <button
                    onClick={() => handleDeleteSegment(segment._id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-xl"
                    title="Delete Segment"
                  >
                    🗑️
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-black border border-white/10 rounded-2xl p-10 mb-10 shadow-xl">
          <h2 className="text-3xl font-bold mb-8 text-white">Define Segment Rules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="segmentName" className="block mb-3 text-sm font-semibold text-white">Segment Name</label>
              <input
                id="segmentName"
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                value={segmentName}
                onChange={(e) => setSegmentName(e.target.value)}
                placeholder="e.g. VIP Customers"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="totalSpend" className="block mb-3 text-sm font-semibold text-white">Total Spend &gt;</label>
              <input
                id="totalSpend"
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                value={rules.totalSpend.value}
                onChange={(e) =>
                  setRules((prev) => ({
                    ...prev,
                    totalSpend: { ...prev.totalSpend, value: parseInt(e.target.value) },
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="visits" className="block mb-3 text-sm font-semibold text-white">Visits &lt;</label>
              <input
                id="visits"
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                value={rules.visits.value}
                onChange={(e) =>
                  setRules((prev) => ({
                    ...prev,
                    visits: { ...prev.visits, value: parseInt(e.target.value) },
                  }))
                }
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="inactiveDays" className="block mb-3 text-sm font-semibold text-white">Inactive Days &gt;</label>
              <input
                id="inactiveDays"
                type="number"
                className="w-full px-4 py-3 rounded-xl bg-black border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all text-base"
                value={rules.inactiveDays}
                onChange={(e) =>
                  setRules((prev) => ({ ...prev, inactiveDays: parseInt(e.target.value) }))
                }
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <button
              onClick={handlePreview}
              disabled={isPreviewLoading || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
            >
              {isPreviewLoading ? "Previewing..." : "Preview Audience"}
            </button>
            <button
              onClick={handleCreate}
              disabled={isLoading || isPreviewLoading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-base"
            >
              {isLoading ? "Creating..." : "Create Segment"}
            </button>
          </div>
        </div>

        {preview && (
          <div className="bg-black border border-white/10 rounded-2xl p-10 shadow-xl">
            <h2 className="text-3xl font-bold mb-6 text-white">📋 Preview Result</h2>
            <p className="text-sm text-gray-400 mb-4 text-lg">
              Total Matches: <strong className="text-white text-xl">{preview.count}</strong>
            </p>
            {preview.sample?.length > 0 && (
              <ul className="mt-4 text-base text-gray-300 list-disc list-inside space-y-2">
                {preview.sample.map((cust) => (
                  <li key={cust._id} className="text-white">
                    {cust.name} ({cust.email})
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Segments;
