'use client';

import { useState, useEffect } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Clock, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function SwapRequestsPage() {
  const [activeTab, setActiveTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      // Fetch Received Requests
      const receivedRes = await fetch('/api/swap/received', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const receivedData = await receivedRes.json();
      if (receivedRes.ok) {
        setReceivedRequests(receivedData.data || []);
      }

      // Fetch Sent Requests
      const sentRes = await fetch('/api/swap/sent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sentData = await sentRes.json();
      if (sentRes.ok) {
        setSentRequests(sentData.data || []);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage({ type: 'error', text: 'Failed to load swap requests.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(id);
    setMessage({ type: '', text: '' });
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`/api/swap/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update request');
      }

      setMessage({ type: 'success', text: data.message });
      fetchRequests(); // Refresh list
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 flex items-center gap-1 w-max">
            <Clock size={12} /> Pending
          </span>
        );
      case 'Accepted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 flex items-center gap-1 w-max">
            <CheckCircle2 size={12} /> Accepted
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 flex items-center gap-1 w-max">
            <XCircle size={12} /> Rejected
          </span>
        );
      case 'Cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 flex items-center gap-1 w-max">
            <AlertCircle size={12} /> Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar active="requests" />

      <main className="ml-64 flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Swap Requests</h1>
              <p className="text-gray-600 text-sm">Manage skills swap requests you received or sent.</p>
            </div>
            <button
              onClick={fetchRequests}
              className="flex items-center gap-2 px-4 py-2 bg-purple-900 text-white rounded-lg hover:bg-purple-800 transition text-sm"
            >
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {/* Alert Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg text-sm ${
                message.type === 'error'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-green-100 text-green-700 border border-green-200'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('received')}
              className={`pb-3 px-6 font-medium text-sm border-b-2 transition ${
                activeTab === 'received'
                  ? 'border-purple-900 text-purple-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Received Requests ({receivedRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`pb-3 px-6 font-medium text-sm border-b-2 transition ${
                activeTab === 'sent'
                  ? 'border-purple-900 text-purple-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sent Requests ({sentRequests.length})
            </button>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading requests...</div>
          ) : activeTab === 'received' ? (
            /* Received Requests List */
            <div>
              {receivedRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                  No received swap requests found.
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900 text-lg">{req.skill?.title || 'Skill'}</h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">From:</span> {req.sender?.name} ({req.sender?.email})
                        </p>
                        <p className="text-xs text-gray-400">
                          Requested on: {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3">
                        {req.status === 'Pending' ? (
                          <>
                            <button
                              disabled={actionLoading === req._id}
                              onClick={() => handleUpdateStatus(req._id, 'Accepted')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                            >
                              {actionLoading === req._id ? 'Processing...' : 'Accept'}
                            </button>
                            <button
                              disabled={actionLoading === req._id}
                              onClick={() => handleUpdateStatus(req._id, 'Rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {actionLoading === req._id ? 'Processing...' : 'Reject'}
                            </button>
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No actions available</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Sent Requests List */
            <div>
              {sentRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-8 text-center text-gray-500 shadow-sm border border-gray-100">
                  No sent swap requests found.
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((req) => (
                    <div
                      key={req._id}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-bold text-gray-900 text-lg">{req.skill?.title || 'Skill'}</h3>
                          {getStatusBadge(req.status)}
                        </div>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-800">To Receiver:</span> {req.receiver?.name} ({req.receiver?.email})
                        </p>
                        <p className="text-xs text-gray-400">
                          Requested on: {new Date(req.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {/* Cancel Button */}
                      <div className="flex items-center gap-3">
                        {req.status === 'Pending' ? (
                          <button
                            disabled={actionLoading === req._id}
                            onClick={() => handleUpdateStatus(req._id, 'Cancelled')}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
                          >
                            {actionLoading === req._id ? 'Processing...' : 'Cancel Request'}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 italic">No actions available</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}