package com.travelplanner.roost.common.web;

import org.springframework.data.domain.Page;

public record PageMeta(int page, int pageSize, long total, int totalPages) {

    public static PageMeta from(Page<?> page) {
        return new PageMeta(
                page.getNumber() + 1,
                page.getSize(),
                page.getTotalElements(),
                Math.max(1, page.getTotalPages()));
    }

    public static PageMeta of(int page, int pageSize, long total) {
        int totalPages = pageSize <= 0 ? 1 : (int) Math.max(1, Math.ceil((double) total / pageSize));
        return new PageMeta(page, pageSize, total, totalPages);
    }
}
