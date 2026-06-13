package com.travelplanner.roost;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class RoostModularityTests {

    @Test
    void verifiesModuleBoundaries() {
        ApplicationModules.of(RoostApplication.class).verify();
    }
}
