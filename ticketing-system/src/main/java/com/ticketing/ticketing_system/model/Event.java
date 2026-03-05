package com.ticketing.ticketing_system.model;

import lombok.Data;

@Data
public class Event {
    private String id;
    private String name;
    private String description;
    private String date;
    private String venue;
}
