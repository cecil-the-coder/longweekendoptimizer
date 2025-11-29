import HolidayForm from './components/HolidayForm';
import HolidayList from './components/HolidayList';
import RecommendationsSection from './components/RecommendationsSection';
import PredefinedHolidays from './components/PredefinedHolidays';
import ErrorBoundary from './components/ErrorBoundary';
import { HolidayProvider } from './context/HolidayContext';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <HolidayProvider>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-700 mb-2">Long Weekend Optimizer</h1>
              <p className="text-gray-600">Add your company holidays to find long weekends</p>
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

              {/* Holiday Input Section */}
              <div className="w-full max-w-2xl mx-auto">
                <details className="group">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">Add Holidays</h2>
                        <p className="text-sm text-gray-600">Quick add or manually enter holidays</p>
                      </div>
                      <svg
                        className="w-6 h-6 text-gray-600 transition-transform group-open:rotate-180"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>

                  <div className="mt-4 space-y-8">
                    <ErrorBoundary>
                      <PredefinedHolidays />
                    </ErrorBoundary>

                    <ErrorBoundary>
                      <HolidayForm />
                    </ErrorBoundary>
                  </div>
                </details>
              </div>
            </main>
          </div>
        </div>
      </HolidayProvider>
    </ErrorBoundary>
  );
}

export default App;