package com.travelplanner.roost.common.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.travelplanner.roost.common.error.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class RestAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper mapper;

    public RestAccessDeniedHandler(ObjectMapper mapper) {
        this.mapper = mapper;
    }

    @Override
    public void handle(
            HttpServletRequest request, HttpServletResponse response, AccessDeniedException ex)
            throws IOException {
        SecurityErrorWriter.write(
                response, ErrorCode.FORBIDDEN, "You do not have permission to perform this action", mapper);
    }
}
