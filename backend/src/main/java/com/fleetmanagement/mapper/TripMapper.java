package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.TripResponse;
import com.fleetmanagement.entity.Trip;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface TripMapper {

    @Mapping(source = "tripNumber", target = "tripNumber")
    @Mapping(source = "lrNumber", target = "lrNumber")
    @Mapping(source = "client.name", target = "clientName")
    @Mapping(source = "route.origin", target = "origin")
    @Mapping(source = "route.destination", target = "destination")
    @Mapping(source = "vehicle.registrationNumber", target = "vehicleRegistration")
    @Mapping(target = "driverName", expression = "java(trip.getDriver() != null ? trip.getDriver().getFirstName() + \" \" + (trip.getDriver().getLastName() != null ? trip.getDriver().getLastName() : \"\") : null)")
    @Mapping(source = "revenue", target = "revenue")
    @Mapping(target = "delayed", expression = "java(trip.getActualArrival() != null && trip.getScheduledStart() != null && trip.getActualArrival().isAfter(trip.getScheduledStart().plusHours(24)))")
    TripResponse toResponse(Trip trip);
}
