import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Ticket,
  Clock,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
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
import { fetchUserBookings, logoutUser, type Booking } from "../services/api";

export default function BookingHistory() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const authToken = window.localStorage.getItem("token");
  const storedEmail = window.localStorage.getItem("userEmail");
  const storedName = window.localStorage.getItem("userName");
  const userId = String(user?.id ?? storedEmail ?? user?.email ?? "guest");
  const username =
    user?.name || storedName || storedEmail || user?.email || "User";

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadBookings();
  }, [userId]);

  async function loadBookings() {
    try {
      if (userId === "guest") {
        setBookings([]);
        return;
      }
      const result = await fetchUserBookings(userId);

      if (result.success && result.bookings) {
        setBookings(result.bookings);
      } else {
        const err = "error" in result ? result.error : undefined;
        console.error("Failed to fetch bookings:", err);
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
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

  function formatBookingDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/events">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Bookings
                </h1>
                <p className="text-gray-600 mt-1">
                  View your confirmed ticket bookings
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <User className="h-4 w-4 mr-2" />
                  {username}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
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
      </header>

      {/* Bookings List */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Ticket className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              You haven't made any bookings yet
            </p>
            <Link to="/events">
              <Button>Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card
                key={booking.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">
                        {booking.eventName}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Booked on {formatBookingDate(booking.bookedAt)}
                        </span>
                      </div>
                    </div>
                    <Badge className="bg-green-500">Confirmed</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Event Details */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-2">
                        <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Event Date
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.eventDate
                              ? formatDate(booking.eventDate)
                              : "TBA"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-gray-700">
                            Venue
                          </p>
                          <p className="text-sm text-gray-600">
                            {booking.venue || "TBA"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Seat Details */}
                    <div>
                      <div className="flex items-start gap-2">
                        <Ticket className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-700 mb-2">
                            Your Seats ({booking.seatIds.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {booking.seatIds.map((seatId) => (
                              <Badge key={seatId} variant="secondary">
                                {seatId}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Booking ID */}
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-500">
                      Booking ID:{" "}
                      <span className="font-mono">{booking.id}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {bookings.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">
                    {bookings.length}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Bookings</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {bookings.reduce((sum, b) => sum + b.seatIds.length, 0)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Total Tickets</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-purple-600">
                    {new Set(bookings.map((b) => b.eventId)).size}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">Unique Events</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
