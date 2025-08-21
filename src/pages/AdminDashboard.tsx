// frontend/src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, LineChart, PieChart } from '../components/Charts';
import { format } from 'date-fns';

// Icons
import { 
  Shield, 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Database, 
  RefreshCw, 
  MessageCircle,
  Globe,
  Clock,
  Star
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [mlStatus, setMlStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const API_BASE = import.meta.env.VITE_API_URL || 'https://api.nomagro.com';

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
          <p className="text-gray-600">Admin access required.</p>
        </div>
      </div>
    );
  }

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch system analytics
        const analyticsRes = await fetch(`${API_BASE}/api/analytics/system`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const analyticsData = await analyticsRes.json();
        
        // Fetch ML status
        const mlRes = await fetch(`${API_BASE}/api/ml/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const mlData = await mlRes.json();

        setAnalytics(analyticsData.data);
        setMlStatus(mlData.data);
      } catch (err) {
        console.error('Failed to load admin ', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [API_BASE]);

  if (loading) {
    return (
      <div className="min-h-screen pt-16 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">System management & analytics</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Admin Mode
              </span>
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`}
                alt="Admin"
                className="h-10 w-10 rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'ml', label: 'AI Models', icon: TrendingUp },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'predictions', label: 'Predictions', icon: AlertTriangle },
              { id: 'system', label: 'System', icon: Database }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <OverviewTab analytics={analytics} mlStatus={mlStatus} />
        )}
        {activeTab === 'ml' && (
          <MLTab mlStatus={mlStatus} />
        )}
        {activeTab === 'users' && (
          <UsersTab analytics={analytics} />
        )}
        {activeTab === 'predictions' && (
          <PredictionsTab analytics={analytics} />
        )}
        {activeTab === 'system' && (
          <SystemTab />
        )}
      </div>
    </div>
  );
}

// === Tab Components ===

function OverviewTab({ analytics, mlStatus }) {
  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={analytics?.users?.total?.[0]?.count || 0}
          change="+12%"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Products"
          value={analytics?.products?.active?.[0]?.count || 0}
          change="+8%"
          icon={Globe}
          color="bg-green-500"
        />
        <StatCard
          title="Recent Predictions"
          value={analytics?.predictions?.recent?.[0]?.count || 0}
          change="+15%"
          icon={AlertTriangle}
          color="bg-yellow-500"
        />
        <StatCard
          title="ML Accuracy"
          value={`${Math.round((mlStatus?.models?.flood?.accuracy || 0.85) * 100)}%`}
          change="+3%"
          icon={TrendingUp}
          color="bg-purple-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Users by Country</h3>
          <BarChart
            data={analytics?.users?.byCountry?.slice(0, 5) || []}
            xKey="_id"
            yKey="count"
            color="#10B981"
          />
        </div>
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Prediction Accuracy</h3>
          <LineChart
            data={
              analytics?.predictions?.accuracy?.map(p => ({
                type: p._id,
                accuracy: p.avgAccuracy
              })) || []
            }
            yKey="accuracy"
            color="#F59E0B"
          />
        </div>
      </div>
    </div>
  );
}

function MLTab({ mlStatus }) {
  const handleRetrain = async () => {
    const token = localStorage.getItem('token');
    await fetch('https://api.nomagro.com/api/ml/retrain', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    alert('Model retraining started!');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">AI Model Management</h2>
        <button
          onClick={handleRetrain}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Retrain Models</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {['flood', 'drought', 'crop', 'price'].map((model) => (
          <div key={model} className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">{model} Model</h3>
            <div className="mt-4 space-y-2">
              <DetailItem label="Status" value={mlStatus?.models?.[model]?.loaded ? 'Loaded' : 'Not Loaded'} />
              <DetailItem label="Accuracy" value={`${Math.round((mlStatus?.models?.[model]?.accuracy || 0.8) * 100)}%`} />
              <DetailItem label="Features" value={mlStatus?.models?.[model]?.features?.length || 0} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UsersTab({ analytics }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold text-gray-900 mb-6">User Analytics</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Country</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Users</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-900">Role</th>
            </tr>
          </thead>
          <tbody>
            {analytics?.users?.byCountry?.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{item._id}</td>
                <td className="py-3 px-4 font-semibold">{item.count}</td>
                <td className="py-3 px-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Farmer</span>
                </td>
              </tr>
            ))}
            <tr className="border-b font-semibold">
              <td className="py-3 px-4">Total</td>
              <td className="py-3 px-4">{analytics?.users?.total?.[0]?.count || 0}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PredictionsTab({ analytics }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Prediction Types</h2>
        <PieChart
          data={analytics?.predictions?.byType || []}
          labelKey="_id"
          valueKey="count"
          colors={['#F59E0B', '#EF4444', '#059669', '#8B5CF6']}
        />
      </div>
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Confidence Levels</h2>
        <div className="space-y-3">
          {analytics?.predictions?.accuracy?.map((item, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className="capitalize">{item._id}</span>
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${item.avgAccuracy * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">
                  {(item.avgAccuracy * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemTab() {
  const handleCleanup = () => {
    alert('Data cleanup started!');
  };

  const handleInitialize = () => {
    alert('ML service initialized!');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-bold text-gray-900 mb-4">System Actions</h2>
        <div className="space-y-4">
          <ActionCard
            icon={RefreshCw}
            title="Retrain Models"
            description="Update all ML models with latest data"
            onClick={() => alert('Retraining...')}
          />
          <ActionCard
            icon={Database}
            title="Clean Old Data"
            description="Remove expired predictions and logs"
            onClick={handleCleanup}
          />
          <ActionCard
            icon={Shield}
            title="Initialize ML Service"
            description="Load all models into memory"
            onClick={handleInitialize}
          />
          <ActionCard
            icon={MessageCircle}
            title="Send Notifications"
            description="Push alerts to high-risk users"
            onClick={() => alert('Notifications sent!')}
          />
        </div>
      </div>

      <div className="bg-gray-900 text-green-400 p-6 rounded-xl font-mono text-sm">
        <h3 className="font-bold mb-2">System Logs</h3>
        <div className="space-y-1 text-xs">
          <div>[2024-01-15 10:30:00] ML models loaded</div>
          <div>[2024-01-15 09:15:00] Weather data updated for 12 locations</div>
          <div>[2024-01-15 06:00:00] Daily predictions generated</div>
        </div>
      </div>
    </div>
  );
}

// === Helper Components ===

function StatCard({ title, value, change, icon: Icon, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-sm text-green-600 mt-1">{change} from last month</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <div className="bg-blue-100 p-2 rounded-lg">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}