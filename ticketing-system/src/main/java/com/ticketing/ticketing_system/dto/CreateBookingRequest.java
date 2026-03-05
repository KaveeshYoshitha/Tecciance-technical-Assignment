package com.ticketing.ticketing_system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateBookingRequest {
    @NotBlank
    private String eventId;

    @NotEmpty
    private List<String> seatIds;

    @NotBlank
    private String userId;

    @NotBlank
    private String username;

    @NotBlank
    private String bookingId;
}
