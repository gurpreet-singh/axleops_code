package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.response.TripResponse;
import com.fleetmanagement.entity.Client;
import com.fleetmanagement.entity.Route;
import com.fleetmanagement.entity.Trip;
import com.fleetmanagement.entity.Vehicle;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-29T11:16:30+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class TripMapperImpl implements TripMapper {

    @Override
    public TripResponse toResponse(Trip trip) {
        if ( trip == null ) {
            return null;
        }

        TripResponse tripResponse = new TripResponse();

        tripResponse.setTripNumber( trip.getTripNumber() );
        tripResponse.setLrNumber( trip.getLrNumber() );
        tripResponse.setClientName( tripClientName( trip ) );
        tripResponse.setOrigin( tripRouteOrigin( trip ) );
        tripResponse.setDestination( tripRouteDestination( trip ) );
        tripResponse.setVehicleRegistration( tripVehicleRegistrationNumber( trip ) );
        tripResponse.setRevenue( trip.getRevenue() );
        tripResponse.setId( trip.getId() );
        tripResponse.setStatus( trip.getStatus() );
        tripResponse.setScheduledStart( trip.getScheduledStart() );
        tripResponse.setActualStart( trip.getActualStart() );
        tripResponse.setActualArrival( trip.getActualArrival() );

        tripResponse.setDriverName( trip.getDriver() != null ? trip.getDriver().getFirstName() + " " + (trip.getDriver().getLastName() != null ? trip.getDriver().getLastName() : "") : null );
        tripResponse.setDelayed( trip.getActualArrival() != null && trip.getScheduledStart() != null && trip.getActualArrival().isAfter(trip.getScheduledStart().plusHours(24)) );

        return tripResponse;
    }

    private String tripClientName(Trip trip) {
        Client client = trip.getClient();
        if ( client == null ) {
            return null;
        }
        return client.getName();
    }

    private String tripRouteOrigin(Trip trip) {
        Route route = trip.getRoute();
        if ( route == null ) {
            return null;
        }
        return route.getOrigin();
    }

    private String tripRouteDestination(Trip trip) {
        Route route = trip.getRoute();
        if ( route == null ) {
            return null;
        }
        return route.getDestination();
    }

    private String tripVehicleRegistrationNumber(Trip trip) {
        Vehicle vehicle = trip.getVehicle();
        if ( vehicle == null ) {
            return null;
        }
        return vehicle.getRegistrationNumber();
    }
}
