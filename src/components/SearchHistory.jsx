import React from 'react';

const SearchHistory = ({ history, onHistoryClick, loading }) => {
  if (history.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Search History</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-gray-600">No search history yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Your recent searches will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Search History</h3>
      <div className="space-y-2">
        {history.map((city, index) => (
          <button
            key={`${city}-${index}`}
            onClick={() => onHistoryClick(city)}
            disabled={loading}
            className="w-full text-left p-3 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">{city}</span>
              <span className="text-gray-400">→</span>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Click on any city to search again
        </p>
      </div>
    </div>
  );
};

export default SearchHistory;
