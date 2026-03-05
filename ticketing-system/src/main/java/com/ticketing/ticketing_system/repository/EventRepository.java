package com.ticketing.ticketing_system.repository;

import com.ticketing.ticketing_system.model.Event;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class EventRepository {

    private final JdbcTemplate jdbcTemplate;

    public EventRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public List<Event> findAll() {
        String sql = "SELECT id, name, description, date, venue FROM events ORDER BY date";
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Event event = new Event();
            event.setId(rs.getString("id"));
            event.setName(rs.getString("name"));
            event.setDescription(rs.getString("description"));
            event.setDate(rs.getString("date"));
            event.setVenue(rs.getString("venue"));
            return event;
        });
    }

    public Event findById(String id) {
        String sql = "SELECT id, name, description, date, venue FROM events WHERE id = ?";
        try {
            return jdbcTemplate.queryForObject(sql, (rs, rowNum) -> {
                Event event = new Event();
                event.setId(rs.getString("id"));
                event.setName(rs.getString("name"));
                event.setDescription(rs.getString("description"));
                event.setDate(rs.getString("date"));
                event.setVenue(rs.getString("venue"));
                return event;
            }, id);
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }
}
