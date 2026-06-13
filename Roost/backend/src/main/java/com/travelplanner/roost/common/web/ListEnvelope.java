package com.travelplanner.roost.common.web;

import java.util.List;
import org.springframework.data.domain.Page;

public record ListEnvelope<T>(List<T> data, PageMeta meta) {

    public static <T> ListEnvelope<T> from(Page<T> page) {
        return new ListEnvelope<>(page.getContent(), PageMeta.from(page));
    }

    public static <T> ListEnvelope<T> of(List<T> data, PageMeta meta) {
        return new ListEnvelope<>(data, meta);
    }
}
