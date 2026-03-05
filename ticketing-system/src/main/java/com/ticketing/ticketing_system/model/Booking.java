package com.ticketing.ticketing_system.model;

import lombok.Data;

import java.util.List;

@Data
public class Booking {
    private String id;
    private String eventId;
    private String eventName;
    private String eventDate;
    private String venue;
    private String bookedAt;
    private List<String> seatIds;
}
