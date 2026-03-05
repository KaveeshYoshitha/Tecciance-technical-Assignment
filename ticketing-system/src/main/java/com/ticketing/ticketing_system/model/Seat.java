package com.ticketing.ticketing_system.model;

import lombok.Data;

@Data
public class Seat {
    private String id;
    private String row;
    private int number;
    private String status;
    private String lockedBy;
    private Long lockedUntil;
}
