import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface StallLayoutProps {
  children: ReactNode;
  stallName: string;
  organizerId: string;
  eventId: string;
}

export default function StallLayout({ children, stallName, organizerId, eventId }: StallLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link
                to={`/dashboard/event-organizers/${organizerId}/events/${eventId}`}
                className="flex items-center text-gray-500 hover:text-gray-700"
              >
                <ChevronLeft className="h-5 w-5 mr-2" />
                Back to Event Details
              </Link>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{stallName}</h1>
            </div>
            <div className="w-40">
              {/* Placeholder for right side of header if needed */}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          {children}
        </div>
      </main>
    </div>
  );
} 