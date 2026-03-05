package com.ticketing.ticketing_system.controller;

import com.ticketing.ticketing_system.dto.BookingHistoryResponse;
import com.ticketing.ticketing_system.dto.CreateBookingRequest;
import com.ticketing.ticketing_system.dto.GenericSuccessResponse;
import com.ticketing.ticketing_system.service.SeatBookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final SeatBookingService seatBookingService;

    public BookingController(SeatBookingService seatBookingService) {
        this.seatBookingService = seatBookingService;
    }

    @PostMapping
    public GenericSuccessResponse createBooking(@Valid @RequestBody CreateBookingRequest request) {
        seatBookingService.createBooking(request);
        return GenericSuccessResponse.ok();
    }

    @GetMapping("/user/{userId}")
    public BookingHistoryResponse getUserBookings(@PathVariable String userId) {
        return BookingHistoryResponse.ok(seatBookingService.getBookingsForUser(userId));
    }
}
