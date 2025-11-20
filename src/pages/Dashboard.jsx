import { useEffect, useState } from "react";
import { API_BASE_URL as API_BASE } from '../config/api';
import { 
  FiUsers, 
  FiLayers, 
  FiMail, 
  FiMessageSquare,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiInfo,
  FiStar,
  FiClock
} from "react-icons/fi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    customers: 0,
    segments: 0,
    campaigns: 0,
    aiMessagesGenerated: 0,
  });
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch dashboard metrics");
        const data = await res.json();
        setMetrics(data.data || data);
      } catch (err) {
        console.error("❌ Failed to fetch dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchInsights = async () => {
      try {
        setInsightsLoading(true);
        const res = await fetch(`${API_BASE}/api/insights`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch insights");
        const data = await res.json();
        setInsights(data.data?.insights || data.insights || []);
      } catch (err) {
        console.error("❌ Failed to fetch insights:", err);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const metricsChartData = [
    { name: 'Customers', value: metrics.customers },
    { name: 'Segments', value: metrics.segments },
    { name: 'Campaigns', value: metrics.campaigns },
  ];

  const getInsightIcon = (iconName) => {
    const icons = {
      users: FiUsers,
      trending: FiTrendingUp,
      alert: FiAlertCircle,
      'alert-circle': FiAlertCircle,
      'check-circle': FiCheckCircle,
      info: FiInfo,
      star: FiStar,
      clock: FiClock,
    };
    return icons[iconName] || FiInfo;
  };

  const getInsightColor = (type) => {
    const colors = {
      success: 'bg-green-500/10 border-green-500/30 text-green-400',
      warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400',
      error: 'bg-red-500/10 border-red-500/30 text-red-400',
      info: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    };
    return colors[type] || colors.info;
  };

  const MetricCard = ({ title, value, icon: Icon, gradient }) => (
    <div className="bg-black border border-white/10 rounded-2xl p-6 shadow-xl hover:border-purple-500/30 transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</p>
          <h3 className="text-white text-4xl font-bold">{value.toLocaleString()}</h3>
        </div>
        <div className={`p-4 rounded-xl ${gradient} shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-5xl font-extrabold text-white mb-3">
            Dashboard Overview
          </h1>
          <p className="text-gray-400 text-lg">Monitor your CRM performance and insights</p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <>
            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <MetricCard
                title="Total Customers"
                value={metrics.customers}
                icon={FiUsers}
                gradient="bg-gradient-to-br from-blue-600 to-cyan-500"
              />
              <MetricCard
                title="Total Segments Created"
                value={metrics.segments}
                icon={FiLayers}
                gradient="bg-gradient-to-br from-purple-600 to-pink-500"
              />
              <MetricCard
                title="Total Campaigns"
                value={metrics.campaigns}
                icon={FiMail}
                gradient="bg-gradient-to-br from-indigo-600 to-purple-500"
              />
              <MetricCard
                title="AI Messages Generated"
                value={metrics.aiMessagesGenerated}
                icon={FiMessageSquare}
                gradient="bg-gradient-to-br from-green-600 to-emerald-500"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-10">
              {/* Bar Chart */}
              <div className="bg-black border border-white/10 rounded-2xl p-8 shadow-xl">
                <h2 className="text-2xl font-bold text-white mb-8">Metrics Overview</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metricsChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333333" />
                    <XAxis dataKey="name" stroke="#ffffff" />
                    <YAxis stroke="#ffffff" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#000000', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        color: '#ffffff'
                      }}
                    />
                    <Bar dataKey="value" fill="url(#colorGradient)" radius={[12, 12, 0, 0]}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights Section */}
            <div className="bg-black border border-white/10 rounded-2xl p-8 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                <FiInfo className="text-blue-400" />
                Business Insights
              </h2>
              
              {insightsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : insights.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg">No insights available at the moment.</p>
                  <p className="text-sm mt-2">Insights will appear as you add more data to your CRM.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insights.map((insight, index) => {
                    const Icon = getInsightIcon(insight.icon);
                    return (
                      <div
                        key={index}
                        className={`p-5 rounded-xl border ${getInsightColor(insight.type)} transition-all hover:scale-105`}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className="w-6 h-6 mt-0.5 flex-shrink-0" />
                          <div>
                            <h3 className="font-bold text-base mb-1">{insight.title}</h3>
                            <p className="text-sm opacity-90">{insight.message}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
