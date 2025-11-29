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
              <ErrorBoundary>
                <HolidayForm />
              </ErrorBoundary>

              <ErrorBoundary>
                <PredefinedHolidays />
              </ErrorBoundary>

              <ErrorBoundary>
                <HolidayList />
              </ErrorBoundary>

              <ErrorBoundary>
                <RecommendationsSection />
              </ErrorBoundary>
            </main>
          </div>
        </div>
      </HolidayProvider>
    </ErrorBoundary>
  );
}

export default App;