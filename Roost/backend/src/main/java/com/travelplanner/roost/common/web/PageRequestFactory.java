package com.travelplanner.roost.common.web;

import com.travelplanner.roost.common.error.ValidationException;
import java.util.Map;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public final class PageRequestFactory {

    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 100;

    private PageRequestFactory() {}

    public static int clampPage(Integer page) {
        return (page == null || page < 1) ? 1 : page;
    }

    public static int clampPageSize(Integer pageSize) {
        if (pageSize == null || pageSize < 1) {
            return DEFAULT_PAGE_SIZE;
        }
        return Math.min(pageSize, MAX_PAGE_SIZE);
    }

    public static Pageable of(
            Integer page, Integer pageSize, String sortBy, String order, Map<String, String> sortWhitelist) {
        int p = clampPage(page);
        int size = clampPageSize(pageSize);
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.isBlank()) {
            String column = sortWhitelist.get(sortBy);
            if (column == null) {
                throw new ValidationException(
                        "Invalid sort field",
                        Map.of("sortBy", "must be one of " + sortWhitelist.keySet()));
            }
            Sort.Direction direction = "desc".equalsIgnoreCase(order) ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, column);
        }
        return PageRequest.of(p - 1, size, sort);
    }
}
