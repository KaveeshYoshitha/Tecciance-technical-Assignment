package com.ticketing.ticketing_system.repository;

import com.ticketing.ticketing_system.model.Booking;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
public class BookingRepository {

    private final JdbcTemplate jdbcTemplate;

    public BookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void createBooking(String bookingId, String eventId, String userId, String username, long createdAtMillis) {
        String sql = "INSERT INTO bookings (id, event_id, user_id, username, created_at) VALUES (?, ?, ?, ?, ?)";
        jdbcTemplate.update(sql, bookingId, eventId, userId, username, createdAtMillis);
    }

    public void addBookingSeats(String bookingId, String eventId, List<String> seatIds) {
        String sql = "INSERT INTO booking_seats (booking_id, event_id, seat_id) VALUES (?, ?, ?)";
        for (String seatId : seatIds) {
            jdbcTemplate.update(sql, bookingId, eventId, seatId);
        }
    }

    public List<Booking> findBookingsByUserId(String userId) {
        String sql = """
                SELECT
                  b.id AS booking_id,
                  b.event_id,
                  b.created_at,
                  e.name AS event_name,
                  e.date AS event_date,
                  e.venue AS venue,
                  bs.seat_id AS seat_id
                FROM bookings b
                INNER JOIN events e ON e.id = b.event_id
                LEFT JOIN booking_seats bs ON bs.booking_id = b.id AND bs.event_id = b.event_id
                WHERE b.user_id = ?
                ORDER BY b.created_at DESC, bs.seat_id ASC
                """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, userId);

        Map<String, Booking> byBookingId = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            String bookingId = String.valueOf(row.get("booking_id"));
            Booking booking = byBookingId.get(bookingId);
            if (booking == null) {
                booking = new Booking();
                booking.setId(bookingId);
                booking.setEventId(String.valueOf(row.get("event_id")));
                booking.setEventName(String.valueOf(row.get("event_name")));
                booking.setEventDate(String.valueOf(row.get("event_date")));
                booking.setVenue(String.valueOf(row.get("venue")));

                Object createdAtObj = row.get("created_at");
                long createdAt = createdAtObj instanceof Number ? ((Number) createdAtObj).longValue() : Long.parseLong(String.valueOf(createdAtObj));
                booking.setBookedAt(Instant.ofEpochMilli(createdAt).toString());

                booking.setSeatIds(new ArrayList<>());
                byBookingId.put(bookingId, booking);
            }

            Object seatIdObj = row.get("seat_id");
            if (seatIdObj != null) {
                booking.getSeatIds().add(String.valueOf(seatIdObj));
            }
        }

        return new ArrayList<>(byBookingId.values());
    }
}
