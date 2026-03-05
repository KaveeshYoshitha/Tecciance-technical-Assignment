package com.ticketing.ticketing_system.repository;

import com.ticketing.ticketing_system.model.Seat;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class SeatRepository {

    private final JdbcTemplate jdbcTemplate;

    public SeatRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Seat> findByEventId(String eventId, long nowMillis) {
        String sql = """
                SELECT
                  seat_id,
                  seat_row,
                  seat_number,
                  CASE
                    WHEN status = 'locked' AND locked_until IS NOT NULL AND locked_until < ? THEN 'available'
                    ELSE status
                  END AS status,
                  CASE
                    WHEN status = 'locked' AND locked_until IS NOT NULL AND locked_until < ? THEN NULL
                    ELSE locked_by
                  END AS locked_by,
                  CASE
                    WHEN status = 'locked' AND locked_until IS NOT NULL AND locked_until < ? THEN NULL
                    ELSE locked_until
                  END AS locked_until
                FROM seats
                WHERE event_id = ?
                ORDER BY seat_row, seat_number
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Seat seat = new Seat();
            seat.setId(rs.getString("seat_id"));
            seat.setRow(rs.getString("seat_row"));
            seat.setNumber(rs.getInt("seat_number"));
            seat.setStatus(rs.getString("status"));
            seat.setLockedBy(rs.getString("locked_by"));
            long lockedUntil = rs.getLong("locked_until");
            seat.setLockedUntil(rs.wasNull() ? null : lockedUntil);
            return seat;
        }, nowMillis, nowMillis, nowMillis, eventId);
    }

    public int lockSeats(String eventId, List<String> seatIds, String userId, long nowMillis, long lockedUntilMillis) {
        if (seatIds.isEmpty()) {
            return 0;
        }

        String placeholders = String.join(",", seatIds.stream().map(s -> "?").toList());

        String sql = "UPDATE seats\n" +
                "SET status = 'locked', locked_by = ?, locked_until = ?\n" +
                "WHERE event_id = ?\n" +
                "  AND seat_id IN (" + placeholders + ")\n" +
                "  AND (\n" +
                "    status = 'available'\n" +
                "    OR (status = 'locked' AND locked_by = ?)\n" +
                "  )\n" +
                "  AND (\n" +
                "    locked_until IS NULL\n" +
                "    OR locked_until < ?\n" +
                "    OR locked_by = ?\n" +
                "  )";

        Object[] args = new Object[6 + seatIds.size()];
        int i = 0;
        args[i++] = userId;
        args[i++] = lockedUntilMillis;
        args[i++] = eventId;
        for (String seatId : seatIds) {
            args[i++] = seatId;
        }
        args[i++] = userId;
        args[i++] = nowMillis;
        args[i] = userId;

        return jdbcTemplate.update(sql, args);
    }

    public int unlockSeats(String eventId, List<String> seatIds, String userId) {
        if (seatIds.isEmpty()) {
            return 0;
        }

        String placeholders = String.join(",", seatIds.stream().map(s -> "?").toList());

        String sql = "UPDATE seats\n" +
                "SET status = 'available', locked_by = NULL, locked_until = NULL\n" +
                "WHERE event_id = ?\n" +
                "  AND seat_id IN (" + placeholders + ")\n" +
                "  AND status = 'locked'\n" +
                "  AND locked_by = ?";

        Object[] args = new Object[2 + seatIds.size()];
        int i = 0;
        args[i++] = eventId;
        for (String seatId : seatIds) {
            args[i++] = seatId;
        }
        args[i] = userId;

        return jdbcTemplate.update(sql, args);
    }

    public int bookSeats(String eventId, List<String> seatIds, String userId, long nowMillis) {
        if (seatIds.isEmpty()) {
            return 0;
        }

        String placeholders = String.join(",", seatIds.stream().map(s -> "?").toList());

        String sql = "UPDATE seats\n" +
                "SET status = 'booked', locked_by = NULL, locked_until = NULL\n" +
                "WHERE event_id = ?\n" +
                "  AND seat_id IN (" + placeholders + ")\n" +
                "  AND status = 'locked'\n" +
                "  AND locked_by = ?\n" +
                "  AND locked_until IS NOT NULL\n" +
                "  AND locked_until >= ?";

        Object[] args = new Object[3 + seatIds.size()];
        int i = 0;
        args[i++] = eventId;
        for (String seatId : seatIds) {
            args[i++] = seatId;
        }
        args[i++] = userId;
        args[i] = nowMillis;

        return jdbcTemplate.update(sql, args);
    }
}
