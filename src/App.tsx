import { useState } from 'react';
import HolidayList from './components/HolidayList';
import RecommendationsSection from './components/RecommendationsSection';
import AddHolidaysPanel from './components/AddHolidaysPanel';
import ErrorBoundary from './components/ErrorBoundary';
import { HolidayProvider } from './context/HolidayContext';
import './App.css';

function App() {
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <ErrorBoundary>
      <HolidayProvider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-700 mb-2">HolidayHacker</h1>
              <p className="text-gray-600">Hack your calendar - maximize your time off with smart vacation planning</p>
            </header>

            <main className="space-y-8">
              {/* Primary Feature: Recommendations */}
              <ErrorBoundary>
                <RecommendationsSection />
              </ErrorBoundary>

              {/* Your Holidays List */}
              <ErrorBoundary>
                <HolidayList />
              </ErrorBoundary>

              {/* Add Holidays Button */}
              <div className="w-full max-w-2xl mx-auto">
                <button
                  onClick={() => setIsPanelOpen(true)}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium">Add Holidays</span>
                </button>
              </div>
            </main>
          </div>
        </div>

        {/* Floating Panel */}
        <AddHolidaysPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
      </HolidayProvider>
    </ErrorBoundary>
  );
}

export default App;