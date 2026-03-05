import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Ticket, History, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { fetchEvents, logoutUser, type Event } from "../services/api";

export default function EventList() {
  const { user, logout } = useAuth();
  const authToken = window.localStorage.getItem("token");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    void loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEvents();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError(
        `Failed to connect to server. Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      if (authToken) {
        await logoutUser(authToken);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ticket className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Event Ticketing
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => navigate("/bookings")}
                className="flex items-center gap-2"
              >
                <History className="h-4 w-4" />
                My Bookings
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {user?.name || user?.email || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuSeparator />

                  {user?.email && (
                    <DropdownMenuItem disabled>{user.email}</DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Events Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Upcoming Events
          </h2>
          <p className="text-gray-600 mt-1">
            Select an event to view available seats
          </p>
        </div>

        {error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-red-800 font-semibold mb-2">
                Connection Error
              </h3>
              <p className="text-red-600 text-sm mb-4">{error}</p>
              <Button onClick={loadEvents} variant="outline">
                Retry
              </Button>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No events available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card
                key={event.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="p-0">
                  <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg overflow-hidden"></div>
                </CardHeader>
                <CardContent className="pt-4">
                  <CardTitle className="text-xl mb-2">{event.name}</CardTitle>
                  <CardDescription className="text-gray-600 mb-4">
                    {event.description}
                  </CardDescription>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <MapPin className="h-4 w-4 text-blue-600" />
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/event/${event.id}`} className="w-full">
                    <Button className="w-full bg-black text-white hover:bg-gray-900">
                      View Seats
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
