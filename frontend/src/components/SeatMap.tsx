import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Check, X, Clock, User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "react-toastify";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../context/AuthContext";
import {
  fetchEventById,
  lockSeats,
  unlockSeats,
  createBooking,
  logoutUser,
  type Seat,
  type Event,
} from "../services/api";

export default function SeatMap() {
  const { user, logout } = useAuth();
  const authToken = window.localStorage.getItem("token");
  const storedEmail = window.localStorage.getItem("userEmail");
  const storedName = window.localStorage.getItem("userName");
  const userId = String(user?.id ?? storedEmail ?? user?.email ?? "guest");
  const username =
    user?.name || storedName || storedEmail || user?.email || "User";

  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  const [event, setEvent] = useState<Event | null>(null);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Fetch event and seats
  const loadEventData = useCallback(async () => {
    if (!eventId) return;

    try {
      const result = await fetchEventById(eventId);

      if (result.success && result.event && result.seats) {
        setEvent(result.event);
        setSeats(result.seats);

        // Check if user has any locked seats
        const userLockedSeats = result.seats.filter(
          (seat: Seat) => seat.status === "locked" && seat.lockedBy === userId,
        );

        if (userLockedSeats.length > 0) {
          setSelectedSeats(userLockedSeats.map((s: Seat) => s.id));
          setLockedUntil(userLockedSeats[0].lockedUntil ?? null);
        }
      } else {
        const err = "error" in result ? result.error : undefined;
        console.error("Failed to load event:", err);
        toast.error(err || "Failed to load event");
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      toast.error(
        `Failed to connect to server: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);
    }
  }, [eventId, userId]);

  useEffect(() => {
    loadEventData();
  }, [loadEventData]);

  // Periodic refresh to update seat states
  useEffect(() => {
    const interval = setInterval(() => {
      loadEventData();
    }, 3000); // Refresh every 3 seconds

    return () => clearInterval(interval);
  }, [loadEventData]);

  // Handle seat selection
  const handleSeatClick = async (seatId: string) => {
    const seat = seats.find((s) => s.id === seatId);
    if (!seat || !eventId) return;

    // Can't select booked seats
    if (seat.status === "booked") {
      toast.error("This seat is already booked");
      return;
    }

    // Can't select seats locked by others
    if (seat.status === "locked" && seat.lockedBy !== userId) {
      toast.error("This seat is locked by another user");
      return;
    }

    // If selecting a new seat
    if (!selectedSeats.includes(seatId)) {
      const newSelection = [...selectedSeats, seatId];
      setSelectedSeats(newSelection);

      // Lock the seats on the server
      try {
        const result = await lockSeats({
          eventId,
          seatIds: newSelection,
          userId,
        });

        if (result.success) {
          setLockedUntil(result.lockedUntil || null);
          toast.success("Seat selected");
          loadEventData(); // Refresh to get updated seat states
        } else {
          // Revert selection if lock failed
          setSelectedSeats(selectedSeats);
          toast.error(result.error || "Failed to lock seat");
        }
      } catch (error) {
        console.error("Error locking seat:", error);
        setSelectedSeats(selectedSeats);
        toast.error("Failed to lock seat");
      }
    } else {
      // Deselecting a seat
      const newSelection = selectedSeats.filter((id) => id !== seatId);

      // Unlock the seat on the server
      try {
        const result = await unlockSeats({
          eventId,
          seatIds: [seatId],
          userId,
        });

        if (result.success) {
          setSelectedSeats(newSelection);
          if (newSelection.length === 0) {
            setLockedUntil(null);
          }
          toast.success("Seat deselected");
          loadEventData();
        }
      } catch (error) {
        console.error("Error unlocking seat:", error);
        toast.error("Failed to unlock seat");
      }
    }
  };

  // Clear all selections
  const clearSelection = async () => {
    if (selectedSeats.length === 0 || !eventId) return;

    try {
      const result = await unlockSeats({
        eventId,
        seatIds: selectedSeats,
        userId,
      });

      if (result.success) {
        setSelectedSeats([]);
        setLockedUntil(null);
        toast.success("Selection cleared");
        loadEventData();
      }
    } catch (error) {
      console.error("Error clearing selection:", error);
      toast.error("Failed to clear selection");
    }
  };

  // Confirm booking
  const confirmBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error("Please select at least one seat");
      return;
    }
    if (!eventId) {
      toast.error("Missing event id");
      return;
    }
    if (userId === "guest") {
      toast.error("Please login to confirm booking");
      return;
    }

    setConfirming(true);

    try {
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const result = await createBooking({
        eventId,
        seatIds: selectedSeats,
        userId,
        username,
        bookingId,
      });

      if (result.success) {
        toast.success("Booking confirmed!");
        setShowConfirmDialog(false);

        // Navigate to booking history after a short delay
        setTimeout(() => {
          navigate("/bookings");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to confirm booking");
        setShowConfirmDialog(false);

        // Refresh seat data
        loadEventData();
      }
    } catch (error) {
      console.error("Error confirming booking:", error);
      toast.error("Failed to confirm booking");
      setShowConfirmDialog(false);
    } finally {
      setConfirming(false);
    }
  };

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

  // Get seat status for styling
  const getSeatStatus = (seat: Seat) => {
    if (seat.status === "booked") return "booked";
    if (seat.status === "locked" && seat.lockedBy === userId) return "selected";
    if (seat.status === "locked") return "locked";
    return "available";
  };

  // Group seats by row
  const seatsByRow = seats.reduce(
    (acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    },
    {} as Record<string, Seat[]>,
  );

  const rows = Object.keys(seatsByRow).sort();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading seats...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event not found</p>
          <Link to="/events">
            <Button className="mt-4">Back to Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/events">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {event.name}
                </h1>
                <p className="text-sm text-gray-600">{event.venue}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {lockedUntil && (
                <CountdownTimer
                  lockedUntil={lockedUntil}
                  onExpire={loadEventData}
                />
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {username}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Select Your Seats</CardTitle>
                <div className="flex gap-6 mt-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600"></div>
                    <span>Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500 rounded border-2 border-blue-600"></div>
                    <span>Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded border-2 border-yellow-600"></div>
                    <span>Locked</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-400 rounded border-2 border-gray-500"></div>
                    <span>Booked</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stage */}
                <div className="mb-8 text-center">
                  <div className="bg-gradient-to-b from-gray-700 to-gray-900 text-white py-3 rounded-lg shadow-lg">
                    STAGE
                  </div>
                </div>

                {/* Seats Grid */}
                <div className="space-y-3">
                  {rows.map((row) => (
                    <div key={row} className="flex items-center gap-2">
                      <div className="w-8 text-center font-semibold text-gray-700">
                        {row}
                      </div>
                      <div className="flex gap-2 flex-1 justify-center">
                        {seatsByRow[row]
                          .sort((a, b) => a.number - b.number)
                          .map((seat) => {
                            const status = getSeatStatus(seat);
                            return (
                              <button
                                key={seat.id}
                                onClick={() => handleSeatClick(seat.id)}
                                disabled={
                                  status === "booked" || status === "locked"
                                }
                                className={`
                                  w-10 h-10 rounded border-2 font-semibold text-xs
                                  transition-all duration-200
                                  ${status === "available" ? "bg-green-500 border-green-600 hover:bg-green-600 cursor-pointer" : ""}
                                  ${status === "selected" ? "bg-blue-500 border-blue-600 hover:bg-blue-600 cursor-pointer" : ""}
                                  ${status === "locked" ? "bg-yellow-500 border-yellow-600 cursor-not-allowed opacity-60" : ""}
                                  ${status === "booked" ? "bg-gray-400 border-gray-500 cursor-not-allowed opacity-60" : ""}
                                `}
                                title={`${seat.id} - ${status}`}
                              >
                                {seat.number}
                              </button>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Selected Seats:</p>
                  {selectedSeats.length === 0 ? (
                    <p className="text-gray-500 italic">No seats selected</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {selectedSeats.map((seatId) => (
                        <Badge key={seatId} variant="secondary">
                          {seatId}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Seats:</span>
                    <span>{selectedSeats.length}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-green-500 text-white hover:bg-green-600"
                    onClick={() => setShowConfirmDialog(true)}
                    disabled={selectedSeats.length === 0}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Confirm Booking
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full bg-red-500 text-white hover:bg-red-600"
                    onClick={clearSelection}
                    disabled={selectedSeats.length === 0}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Selection
                  </Button>
                </div>

                {lockedUntil && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      Your seats are locked. Complete booking before the timer
                      expires or they will be released.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Confirm Booking Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Your Booking</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to book {selectedSeats.length} seat(s) for{" "}
              {event.name}.
              <div className="mt-4 p-3 bg-gray-50 rounded">
                <p className="font-semibold mb-2">Selected Seats:</p>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((seatId) => (
                    <Badge className="bg-black text-white " key={seatId}>
                      {seatId}
                    </Badge>
                  ))}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={confirming}
              className="bg-red-500 text-white hover:bg-red-600  "
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-500 text-white hover:bg-green-600"
              onClick={confirmBooking}
              disabled={confirming}
            >
              {confirming ? "Confirming..." : "Confirm Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Countdown Timer Component
function CountdownTimer({
  lockedUntil,
  onExpire,
}: {
  lockedUntil: number;
  onExpire: () => void;
}) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, lockedUntil - Date.now());
      setTimeLeft(remaining);

      if (remaining === 0) {
        onExpire();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lockedUntil, onExpire]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  const isWarning = timeLeft < 60000; // Less than 1 minute

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isWarning ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      <Clock className="h-5 w-5" />
      <div className="font-mono font-semibold text-lg">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
    </div>
  );
}
