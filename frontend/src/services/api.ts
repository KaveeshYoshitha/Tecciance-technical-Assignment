import axiosClient from "../api/axiosClient";

export type Event = {
  id: string;
  name: string;
  description: string;
  date: string;
  venue: string;
};

export type Seat = {
  id: string;
  row: string;
  number: number;
  status: "available" | "locked" | "booked" | string;
  lockedBy?: string | null;
  lockedUntil?: number | null;
};

export type Booking = {
  id: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  venue: string;
  bookedAt: string;
  seatIds: string[];
};

export async function checkServerHealth(): Promise<boolean> {
  try {
    await axiosClient.get("/auth/login");
    return true;
  } catch (err: any) {
    return !!err?.response;
  }
}

export async function fetchEvents(): Promise<Event[]> {
  const res = await axiosClient.get("/events");

  if (Array.isArray(res.data)) {
    return res.data as Event[];
  }

  const events = (res.data as { events?: Event[] })?.events;
  if (Array.isArray(events)) {
    return events;
  }

  throw new Error("Invalid events response");
}

export async function fetchEventById(
  eventId: string,
): Promise<
  | { success: true; event: Event; seats: Seat[] }
  | { success: false; error?: string }
> {
  try {
    const res = await axiosClient.get(`/events/${encodeURIComponent(eventId)}`);
    const data = res.data as any;

    if (
      data &&
      data.success === true &&
      data.event &&
      Array.isArray(data.seats)
    ) {
      return {
        success: true,
        event: data.event as Event,
        seats: data.seats as Seat[],
      };
    }

    // If backend ever returns plain {event,seats}
    if (data && data.event && Array.isArray(data.seats)) {
      return {
        success: true,
        event: data.event as Event,
        seats: data.seats as Seat[],
      };
    }

    return { success: false, error: "Invalid event response" };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.response?.data || err?.message;
    return {
      success: false,
      error: typeof message === "string" ? message : "Failed to load event",
    };
  }
}

export async function lockSeats(payload: {
  eventId: string;
  seatIds: string[];
  userId: string;
}): Promise<
  { success: true; lockedUntil?: number } | { success: false; error?: string }
> {
  try {
    const res = await axiosClient.post("/seats/lock", payload);
    const data = res.data as any;
    if (data && data.success === true) {
      return {
        success: true,
        lockedUntil:
          typeof data.lockedUntil === "number" ? data.lockedUntil : undefined,
      };
    }
    return { success: false, error: data?.error || "Failed to lock seats" };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.response?.data || err?.message;
    return {
      success: false,
      error: typeof message === "string" ? message : "Failed to lock seats",
    };
  }
}

export async function unlockSeats(payload: {
  eventId: string;
  seatIds: string[];
  userId: string;
}): Promise<{ success: true } | { success: false; error?: string }> {
  try {
    const res = await axiosClient.post("/seats/unlock", payload);
    const data = res.data as any;
    if (data && data.success === true) {
      return { success: true };
    }
    return { success: false, error: data?.error || "Failed to unlock seats" };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.response?.data || err?.message;
    return {
      success: false,
      error: typeof message === "string" ? message : "Failed to unlock seats",
    };
  }
}

export async function createBooking(payload: {
  eventId: string;
  seatIds: string[];
  userId: string;
  username: string;
  bookingId: string;
}): Promise<{ success: true } | { success: false; error?: string }> {
  try {
    const res = await axiosClient.post("/bookings", payload);
    const data = res.data as any;
    if (data && data.success === true) {
      return { success: true };
    }
    return { success: false, error: data?.error || "Failed to create booking" };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.response?.data || err?.message;
    return {
      success: false,
      error: typeof message === "string" ? message : "Failed to create booking",
    };
  }
}

export async function fetchUserBookings(
  userId: string,
): Promise<
  { success: true; bookings: Booking[] } | { success: false; error?: string }
> {
  try {
    const res = await axiosClient.get(
      `/bookings/user/${encodeURIComponent(userId)}`,
    );
    const data = res.data as any;
    if (data && data.success === true && Array.isArray(data.bookings)) {
      return { success: true, bookings: data.bookings as Booking[] };
    }
    if (Array.isArray(res.data)) {
      return { success: true, bookings: res.data as Booking[] };
    }
    return {
      success: false,
      error: data?.error || "Invalid bookings response",
    };
  } catch (err: any) {
    const message =
      err?.response?.data?.message || err?.response?.data || err?.message;
    return {
      success: false,
      error: typeof message === "string" ? message : "Failed to load bookings",
    };
  }
}

export async function logoutUser(token: string): Promise<void> {
  try {
    await axiosClient.post(
      "/auth/logout",
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch {
    // Backend may not implement logout; ignore.
  }
}
