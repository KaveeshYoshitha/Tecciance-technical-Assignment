package com.ticketing.ticketing_system.dto;

import com.ticketing.ticketing_system.model.Event;
import com.ticketing.ticketing_system.model.Seat;
import lombok.Data;

import java.util.List;

@Data
public class EventDetailsResponse {
    private boolean success;
    private Event event;
    private List<Seat> seats;
    private String error;

    public static EventDetailsResponse ok(Event event, List<Seat> seats) {
        EventDetailsResponse res = new EventDetailsResponse();
        res.setSuccess(true);
        res.setEvent(event);
        res.setSeats(seats);
        return res;
    }

    public static EventDetailsResponse fail(String error) {
        EventDetailsResponse res = new EventDetailsResponse();
        res.setSuccess(false);
        res.setError(error);
        return res;
    }
}
