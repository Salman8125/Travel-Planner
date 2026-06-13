package com.travelplanner.roost.hotel.dto;

import com.travelplanner.roost.common.web.PageMeta;
import java.util.List;

public record HotelSearchResult(List<HotelSearchItem> items, PageMeta meta) {}
