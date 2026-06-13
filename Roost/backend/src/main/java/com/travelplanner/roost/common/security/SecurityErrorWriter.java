package com.travelplanner.roost.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.roost.common.error.ErrorCode;
import com.travelplanner.roost.common.error.ErrorResponse;
import com.travelplanner.roost.common.web.RequestIdFilter;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.MDC;
import org.springframework.http.MediaType;

final class SecurityErrorWriter {

    private SecurityErrorWriter() {}

    static void write(HttpServletResponse response, ErrorCode code, String message, ObjectMapper mapper)
            throws IOException {
        String requestId = MDC.get(RequestIdFilter.MDC_KEY);
        response.setStatus(code.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader(RequestIdFilter.HEADER, requestId);
        mapper.writeValue(response.getWriter(), ErrorResponse.of(code, message, null, requestId));
    }
}
