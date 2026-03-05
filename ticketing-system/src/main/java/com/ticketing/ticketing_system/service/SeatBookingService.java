package com.ticketing.ticketing_system.service;

import com.ticketing.ticketing_system.dto.CreateBookingRequest;
import com.ticketing.ticketing_system.model.Booking;
import com.ticketing.ticketing_system.dto.LockSeatsRequest;
import com.ticketing.ticketing_system.repository.BookingRepository;
import com.ticketing.ticketing_system.repository.SeatRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SeatBookingService {

    private static final long LOCK_DURATION_MILLIS = 5 * 60 * 1000; // 5 minutes

    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    public SeatBookingService(SeatRepository seatRepository, BookingRepository bookingRepository) {
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
    }

    @Transactional
    public long lockSeats(LockSeatsRequest request) {
        long now = System.currentTimeMillis();
        long lockedUntil = now + LOCK_DURATION_MILLIS;

        int updated = seatRepository.lockSeats(request.getEventId(), request.getSeatIds(), request.getUserId(), now, lockedUntil);
        if (updated != request.getSeatIds().size()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "One or more seats are not available to lock");
        }

        return lockedUntil;
    }

    @Transactional
    public void unlockSeats(String eventId, java.util.List<String> seatIds, String userId) {
        seatRepository.unlockSeats(eventId, seatIds, userId);
    }

    @Transactional
    public void createBooking(CreateBookingRequest request) {
        long now = System.currentTimeMillis();

        // Book seats that are currently locked by this user and not expired.
        int booked = seatRepository.bookSeats(request.getEventId(), request.getSeatIds(), request.getUserId(), now);
        if (booked != request.getSeatIds().size()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "One or more seats are no longer locked by you");
        }

        bookingRepository.createBooking(request.getBookingId(), request.getEventId(), request.getUserId(), request.getUsername(), now);
        bookingRepository.addBookingSeats(request.getBookingId(), request.getEventId(), request.getSeatIds());
    }

    @Transactional(readOnly = true)
    public java.util.List<Booking> getBookingsForUser(String userId) {
        return bookingRepository.findBookingsByUserId(userId);
    }
}
