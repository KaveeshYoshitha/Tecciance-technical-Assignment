package com.ticketing.ticketing_system.dto;

import com.ticketing.ticketing_system.model.Booking;
import lombok.Data;

import java.util.List;

@Data
public class BookingHistoryResponse {
    private boolean success;
    private List<Booking> bookings;
    private String error;

    public static BookingHistoryResponse ok(List<Booking> bookings) {
        BookingHistoryResponse res = new BookingHistoryResponse();
        res.setSuccess(true);
        res.setBookings(bookings);
        return res;
    }

    public static BookingHistoryResponse fail(String error) {
        BookingHistoryResponse res = new BookingHistoryResponse();
        res.setSuccess(false);
        res.setError(error);
        return res;
    }
}
