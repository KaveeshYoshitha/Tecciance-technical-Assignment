package com.ticketing.ticketing_system.service;

import com.ticketing.ticketing_system.model.Event;
import com.ticketing.ticketing_system.repository.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository eventRepository;

    public EventService(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public List<Event> getEvents() {
        return eventRepository.findAll();
    }
}
