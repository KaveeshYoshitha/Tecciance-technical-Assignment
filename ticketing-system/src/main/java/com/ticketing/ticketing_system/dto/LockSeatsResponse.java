package com.ticketing.ticketing_system.dto;

import lombok.Data;

@Data
public class LockSeatsResponse {
    private boolean success;
    private Long lockedUntil;
    private String error;

    public static LockSeatsResponse ok(Long lockedUntil) {
        LockSeatsResponse res = new LockSeatsResponse();
        res.setSuccess(true);
        res.setLockedUntil(lockedUntil);
        return res;
    }

    public static LockSeatsResponse fail(String error) {
        LockSeatsResponse res = new LockSeatsResponse();
        res.setSuccess(false);
        res.setError(error);
        return res;
    }
}
