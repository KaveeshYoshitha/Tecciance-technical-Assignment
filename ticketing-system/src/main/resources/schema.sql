CREATE TABLE IF NOT EXISTS users (
    id BIGINT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
);

CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        date VARCHAR(30) NOT NULL,
        venue VARCHAR(255) NOT NULL,
        PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS seats (
    event_id VARCHAR(36) NOT NULL,
    seat_id VARCHAR(10) NOT NULL,
    seat_row VARCHAR(5) NOT NULL,
    seat_number INT NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'available',
    locked_by VARCHAR(255) NULL,
    locked_until BIGINT NULL,
    PRIMARY KEY (event_id, seat_id)
);

CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(80) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    created_at BIGINT NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS booking_seats (
    booking_id VARCHAR(80) NOT NULL,
    event_id VARCHAR(36) NOT NULL,
    seat_id VARCHAR(10) NOT NULL,
    PRIMARY KEY (booking_id, event_id, seat_id)
);

INSERT INTO events (id, name, description, date, venue)
VALUES
    ('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21', 'Tech Conference 2026', 'A full-day conference covering modern web, cloud, and AI topics.', '2026-04-10T09:00:00Z', 'City Convention Center'),
    ('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10', 'Live Music Night', 'An evening of live performances by local bands.', '2026-03-20T19:30:00Z', 'Downtown Arena'),
    ('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59', 'Art Expo', 'Explore contemporary art exhibits and meet artists.', '2026-05-05T11:00:00Z', 'Riverside Gallery')
ON DUPLICATE KEY UPDATE id = id;

-- Seed a small seat map (rows A-C, seats 1-8) for each seeded event.
INSERT INTO seats (event_id, seat_id, seat_row, seat_number, status)
VALUES
    -- Tech Conference 2026
    ('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','A1','A',1,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','A2','A',2,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','A3','A',3,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','A4','A',4,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','A5','A',5,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','A6','A',6,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','A7','A',7,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','A8','A',8,'available'),
    ('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','B1','B',1,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','B2','B',2,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','B3','B',3,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','B4','B',4,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','B5','B',5,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','B6','B',6,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','B7','B',7,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','B8','B',8,'available'),
    ('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','C1','C',1,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','C2','C',2,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','C3','C',3,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','C4','C',4,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','C5','C',5,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','C6','C',6,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','C7','C',7,'available'),('8c9f03e9-7f40-4fe9-8dc7-1c8f5c2c3d21','C8','C',8,'available'),

    -- Live Music Night
    ('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','A1','A',1,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','A2','A',2,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','A3','A',3,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','A4','A',4,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','A5','A',5,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','A6','A',6,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','A7','A',7,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','A8','A',8,'available'),
    ('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','B1','B',1,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','B2','B',2,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','B3','B',3,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','B4','B',4,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','B5','B',5,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','B6','B',6,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','B7','B',7,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','B8','B',8,'available'),
    ('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','C1','C',1,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','C2','C',2,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','C3','C',3,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','C4','C',4,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','C5','C',5,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','C6','C',6,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','C7','C',7,'available'),('2b8b8d0d-67c4-4d3d-8a43-2c4e6d8a1f10','C8','C',8,'available'),

    -- Art Expo
    ('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','A1','A',1,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','A2','A',2,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','A3','A',3,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','A4','A',4,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','A5','A',5,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','A6','A',6,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','A7','A',7,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','A8','A',8,'available'),
    ('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','B1','B',1,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','B2','B',2,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','B3','B',3,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','B4','B',4,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','B5','B',5,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','B6','B',6,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','B7','B',7,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','B8','B',8,'available'),
    ('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','C1','C',1,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','C2','C',2,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','C3','C',3,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','C4','C',4,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','C5','C',5,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','C6','C',6,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','C7','C',7,'available'),('f3d0d2c0-8a66-4b02-9a4a-0a8e75d14f59','C8','C',8,'available')
ON DUPLICATE KEY UPDATE event_id = event_id;
