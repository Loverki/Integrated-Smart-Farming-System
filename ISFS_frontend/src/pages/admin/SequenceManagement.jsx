import { useState, useEffect } from 'react';
import api from '../../api/axios';

const SequenceManagement = () => {
  const [sequences, setSequences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchSequenceStatus();
  }, []);

  const fetchSequenceStatus = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sequences/status');
      setSequences(response.data.sequences || []);
    } catch (error) {
      console.error('Error fetching sequence status:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to fetch sequence status' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetSequence = async (sequenceName) => {
    setResetting(sequenceName);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post(`/sequences/reset/${sequenceName}`);
      
      setMessage({ 
        type: 'success', 
        text: `${sequenceName} reset successfully. Next value: ${response.data.nextValue}` 
      });
      
      // Refresh sequence status
      await fetchSequenceStatus();
    } catch (error) {
      console.error(`Error resetting ${sequenceName}:`, error);
      setMessage({ 
        type: 'error', 
        text: `Failed to reset ${sequenceName}` 
      });
    } finally {
      setResetting(null);
    }
  };

  const resetAllSequences = async () => {
    if (!window.confirm('Are you sure you want to reset ALL sequences? This will synchronize all sequences with current database records.')) {
      return;
    }

    setResetting('ALL');
    setMessage({ type: '', text: '' });

    try {
      const response = await api.post('/sequences/reset-all');
      
      setMessage({ 
        type: 'success', 
        text: 'All sequences reset successfully!' 
      });
      
      // Refresh sequence status
      await fetchSequenceStatus();
      
      console.log('Sequence reset results:', response.data.sequenceStatus);
    } catch (error) {
      console.error('Error resetting all sequences:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to reset all sequences' 
      });
    } finally {
      setResetting(null);
    }
  };

  const getStatusBadge = (sequence) => {
    if (sequence.recordCount === 0 && sequence.maxId === 0) {
      return (
        <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
          Empty - OK
        </span>
      );
    }
    
    return (
      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
        ✓ Synced
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Sequence Management</h1>
              <p className="text-gray-600 mt-2">
                Manage database sequences to ensure correct ID generation
              </p>
            </div>
            <button
              onClick={resetAllSequences}
              disabled={resetting !== null}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center gap-2"
            >
              {resetting === 'ALL' ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Resetting All...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reset All Sequences
                </>
              )}
            </button>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-500 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-blue-800">About Sequence Management</h3>
              <p className="text-blue-700 text-sm mt-1">
                Sequences control the auto-increment IDs for database tables. If you've deleted records 
                and want to reuse IDs or synchronize sequences with current data, use this tool.
              </p>
              <p className="text-blue-700 text-sm mt-2 font-medium">
                ⚠️ The farmer sequence is automatically reset during registration to ensure correct IDs.
              </p>
            </div>
          </div>
        </div>

        {/* Sequence Status Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Sequence Status</h2>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading sequence status...</p>
            </div>
          ) : sequences.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <p>No sequence information available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Table Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Sequence Name
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Record Count
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Max ID
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Next ID Should Be
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sequences.map((sequence, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {sequence.tableName === 'FARMER' ? '👨‍🌾' :
                             sequence.tableName === 'FARM' ? '🏡' :
                             sequence.tableName === 'CROP' ? '🌾' :
                             sequence.tableName === 'LABOUR' ? '👥' :
                             sequence.tableName === 'SALES' ? '💰' :
                             sequence.tableName === 'EQUIPMENT' ? '🚜' : '📋'}
                          </span>
                          <span className="font-medium text-gray-900">
                            {sequence.tableName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-700">
                          {sequence.sequenceName}
                        </code>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {sequence.recordCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {sequence.maxId}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="text-sm font-bold text-blue-600">
                          {sequence.nextShouldBe}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {getStatusBadge(sequence)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => resetSequence(sequence.sequenceName)}
                          disabled={resetting !== null}
                          className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2 mx-auto"
                        >
                          {resetting === sequence.sequenceName ? (
                            <>
                              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                              Resetting...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              Reset
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">How to Use</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex items-start gap-3">
              <span className="text-xl">1️⃣</span>
              <div>
                <strong>Check Status:</strong> View current sequence status and record counts.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">2️⃣</span>
              <div>
                <strong>Reset Individual:</strong> Click "Reset" button for a specific sequence to synchronize it.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">3️⃣</span>
              <div>
                <strong>Reset All:</strong> Click "Reset All Sequences" to synchronize all sequences at once.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div>
                <strong>Auto-Reset:</strong> Farmer sequence is automatically reset during new registrations to prevent ID conflicts.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequenceManagement;

