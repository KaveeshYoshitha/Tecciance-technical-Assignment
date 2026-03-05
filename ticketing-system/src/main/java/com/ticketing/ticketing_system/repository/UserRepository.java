package com.ticketing.ticketing_system.repository;

import com.ticketing.ticketing_system.model.User;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbscTemplate;

    public UserRepository(JdbcTemplate jdbscTemplate) {
        this.jdbscTemplate = jdbscTemplate;
    }

    public void saveUser(User user) {
        String sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
        jdbscTemplate.update(sql, user.getName(), user.getEmail(), user.getPassword());
    }

    public User findByEmail(String email) {
        String sql = "SELECT * FROM users WHERE email = ?";
        try {
            return jdbscTemplate.queryForObject(sql, (rs, rowNum) -> {
                User user = new User();
                user.setId(rs.getLong("id"));
                user.setName(rs.getString("name"));
                user.setEmail(rs.getString("email"));
                user.setPassword(rs.getString("password"));
                return user;
            }, email);
        } catch (EmptyResultDataAccessException ex) {
            return null;
        }
    }


}
