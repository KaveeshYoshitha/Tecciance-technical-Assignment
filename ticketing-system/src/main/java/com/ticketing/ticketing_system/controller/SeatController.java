package com.ticketing.ticketing_system.controller;

import com.ticketing.ticketing_system.dto.GenericSuccessResponse;
import com.ticketing.ticketing_system.dto.LockSeatsRequest;
import com.ticketing.ticketing_system.dto.LockSeatsResponse;
import com.ticketing.ticketing_system.dto.UnlockSeatsRequest;
import com.ticketing.ticketing_system.service.SeatBookingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    private final SeatBookingService seatBookingService;

    public SeatController(SeatBookingService seatBookingService) {
        this.seatBookingService = seatBookingService;
    }

    @PostMapping("/lock")
    public LockSeatsResponse lockSeats(@Valid @RequestBody LockSeatsRequest request) {
        long lockedUntil = seatBookingService.lockSeats(request);
        return LockSeatsResponse.ok(lockedUntil);
    }

    @PostMapping("/unlock")
    public GenericSuccessResponse unlockSeats(@Valid @RequestBody UnlockSeatsRequest request) {
        seatBookingService.unlockSeats(request.getEventId(), request.getSeatIds(), request.getUserId());
        return GenericSuccessResponse.ok();
    }
}
