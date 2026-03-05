package com.ticketing.ticketing_system.controller;

import com.ticketing.ticketing_system.dto.EventDetailsResponse;
import com.ticketing.ticketing_system.model.Event;
import com.ticketing.ticketing_system.repository.EventRepository;
import com.ticketing.ticketing_system.repository.SeatRepository;
import com.ticketing.ticketing_system.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;

    public EventController(EventService eventService, EventRepository eventRepository, SeatRepository seatRepository) {
        this.eventService = eventService;
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
    }

    @GetMapping
    public List<Event> getEvents() {
        return eventService.getEvents();
    }

    @GetMapping("/{eventId}")
    public EventDetailsResponse getEventById(@PathVariable String eventId) {
        Event event = eventRepository.findById(eventId);
        if (event == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found");
        }

        long now = System.currentTimeMillis();
        var seats = seatRepository.findByEventId(eventId, now);
        return EventDetailsResponse.ok(event, seats);
    }
}
