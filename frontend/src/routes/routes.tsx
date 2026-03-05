import { createBrowserRouter, Navigate } from "react-router-dom";
import Auth from "../components/Auth";
import EventList from "../components/EventList";
import SeatMap from "../components/SeatMap";
import BookingHistory from "../components/BookingHistory";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },
  {
    path: "/login",
    element: <Auth />,
  },
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },

  {
    path: "/events",
    element: <EventList />,
  },

  {
    path: "/event/:eventId",
    element: <SeatMap />,
  },

  {
    path: "/bookings",
    element: <BookingHistory />,
  },
]);
