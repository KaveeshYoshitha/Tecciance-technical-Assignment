package com.ticketing.ticketing_system.dto;

import lombok.Data;

@Data
public class GenericSuccessResponse {
    private boolean success;
    private String error;

    public static GenericSuccessResponse ok() {
        GenericSuccessResponse res = new GenericSuccessResponse();
        res.setSuccess(true);
        return res;
    }

    public static GenericSuccessResponse fail(String error) {
        GenericSuccessResponse res = new GenericSuccessResponse();
        res.setSuccess(false);
        res.setError(error);
        return res;
    }
}
