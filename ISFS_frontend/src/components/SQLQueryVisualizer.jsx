import PropTypes from 'prop-types';

export default function SQLQueryVisualizer({ queries = [], executionTime = null, showLegend = true }) {
  const getStatusColor = (status) => {
    switch(status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'executing': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'success': return '✅';
      case 'executing': return '⏳';
      case 'error': return '❌';
      case 'pending': return '⏸️';
      default: return '📝';
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-2xl font-bold text-gray-900">🔍 SQL Query Visualizer</h3>
          {executionTime && (
            <span className="text-sm text-green-600 font-semibold">
              ⚡ {executionTime}ms
            </span>
          )}
        </div>
        <p className="text-gray-600 text-sm">Real-time database operations</p>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {queries.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">No queries to display</p>
            <p className="text-xs mt-2">SQL queries will appear here</p>
          </div>
        ) : (
          queries.map((query, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-all ${getStatusColor(query.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{getStatusIcon(query.status)}</span>
                  <span className="font-semibold text-sm">
                    {query.type}
                  </span>
                </div>
                {query.time && (
                  <span className="text-xs font-mono">{query.time.toFixed(2)}ms</span>
                )}
              </div>
              
              {query.description && (
                <p className="text-xs mb-2 opacity-75">{query.description}</p>
              )}
              
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto font-mono whitespace-pre-wrap">
                {query.sql}
              </pre>
              
              {query.status === 'executing' && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {showLegend && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">Query Status:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span>⏸️</span>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⏳</span>
              <span>Executing</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Success</span>
            </div>
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>Error</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

SQLQueryVisualizer.propTypes = {
  queries: PropTypes.arrayOf(PropTypes.shape({
    type: PropTypes.string,
    sql: PropTypes.string,
    status: PropTypes.string,
    description: PropTypes.string,
    time: PropTypes.number
  })),
  executionTime: PropTypes.number,
  showLegend: PropTypes.bool
};

