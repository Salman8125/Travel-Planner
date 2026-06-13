package com.travelplanner.roost.common.error;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.Map;

public record ErrorResponse(ErrorBody error) {

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ErrorBody(String code, String message, Map<String, String> details, String requestId) {}

    public static ErrorResponse of(
            ErrorCode code, String message, Map<String, String> details, String requestId) {
        Map<String, String> d = (details == null || details.isEmpty()) ? null : details;
        return new ErrorResponse(new ErrorBody(code.code(), message, d, requestId));
    }
}
