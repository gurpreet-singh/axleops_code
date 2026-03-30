package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.request.CreateVehicleRequest;
import com.fleetmanagement.dto.response.VehicleResponse;
import com.fleetmanagement.entity.Branch;
import com.fleetmanagement.entity.Client;
import com.fleetmanagement.entity.Contact;
import com.fleetmanagement.entity.Vehicle;
import com.fleetmanagement.entity.master.VehicleTypeMaster;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T10:18:34+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class VehicleMapperImpl implements VehicleMapper {

    @Override
    public VehicleResponse toResponse(Vehicle vehicle) {
        if ( vehicle == null ) {
            return null;
        }

        VehicleResponse vehicleResponse = new VehicleResponse();

        vehicleResponse.setVehicleTypeId( vehicleVehicleTypeMasterId( vehicle ) );
        vehicleResponse.setVehicleTypeName( vehicleVehicleTypeMasterName( vehicle ) );
        vehicleResponse.setBranchId( vehicleBranchId( vehicle ) );
        vehicleResponse.setBranchName( vehicleBranchName( vehicle ) );
        vehicleResponse.setClientId( vehicleClientId( vehicle ) );
        vehicleResponse.setClientName( vehicleClientName( vehicle ) );
        vehicleResponse.setOperatorId( vehicleOperatorId( vehicle ) );
        vehicleResponse.setOperatorName( vehicleOperatorFirstName( vehicle ) );
        vehicleResponse.setId( vehicle.getId() );
        vehicleResponse.setRegistrationNumber( vehicle.getRegistrationNumber() );
        vehicleResponse.setVehicleCategory( vehicle.getVehicleCategory() );
        vehicleResponse.setYear( vehicle.getYear() );
        vehicleResponse.setMake( vehicle.getMake() );
        vehicleResponse.setModel( vehicle.getModel() );
        vehicleResponse.setMfgMonthYear( vehicle.getMfgMonthYear() );
        vehicleResponse.setChassisNumber( vehicle.getChassisNumber() );
        vehicleResponse.setEngineNumber( vehicle.getEngineNumber() );
        vehicleResponse.setColor( vehicle.getColor() );
        vehicleResponse.setBodyType( vehicle.getBodyType() );
        vehicleResponse.setFuelType( vehicle.getFuelType() );
        vehicleResponse.setAxleConfig( vehicle.getAxleConfig() );
        vehicleResponse.setUlwKg( vehicle.getUlwKg() );
        vehicleResponse.setRlwKg( vehicle.getRlwKg() );
        vehicleResponse.setPayloadCapacityKg( vehicle.getPayloadCapacityKg() );
        vehicleResponse.setSeatingCapacity( vehicle.getSeatingCapacity() );
        vehicleResponse.setHpCc( vehicle.getHpCc() );
        vehicleResponse.setOdometer( vehicle.getOdometer() );
        vehicleResponse.setStatus( vehicle.getStatus() );
        vehicleResponse.setRegistrationDate( vehicle.getRegistrationDate() );
        vehicleResponse.setRegistrationState( vehicle.getRegistrationState() );
        vehicleResponse.setRtoOffice( vehicle.getRtoOffice() );
        vehicleResponse.setOwnership( vehicle.getOwnership() );
        vehicleResponse.setSoldFlag( vehicle.getSoldFlag() );
        vehicleResponse.setHypothecation( vehicle.getHypothecation() );
        vehicleResponse.setVehicleGroup( vehicle.getVehicleGroup() );
        vehicleResponse.setGroupId( vehicle.getGroupId() );

        return vehicleResponse;
    }

    @Override
    public Vehicle toEntity(CreateVehicleRequest request) {
        if ( request == null ) {
            return null;
        }

        Vehicle vehicle = new Vehicle();

        vehicle.setRegistrationNumber( request.getRegistrationNumber() );
        vehicle.setVehicleCategory( request.getVehicleCategory() );
        vehicle.setMake( request.getMake() );
        vehicle.setModel( request.getModel() );
        vehicle.setYear( request.getYear() );
        vehicle.setMfgMonthYear( request.getMfgMonthYear() );
        vehicle.setChassisNumber( request.getChassisNumber() );
        vehicle.setEngineNumber( request.getEngineNumber() );
        vehicle.setColor( request.getColor() );
        vehicle.setBodyType( request.getBodyType() );
        vehicle.setFuelType( request.getFuelType() );
        vehicle.setAxleConfig( request.getAxleConfig() );
        vehicle.setUlwKg( request.getUlwKg() );
        vehicle.setRlwKg( request.getRlwKg() );
        vehicle.setPayloadCapacityKg( request.getPayloadCapacityKg() );
        vehicle.setSeatingCapacity( request.getSeatingCapacity() );
        vehicle.setHpCc( request.getHpCc() );
        vehicle.setOdometer( request.getOdometer() );
        vehicle.setStatus( request.getStatus() );
        vehicle.setRegistrationDate( request.getRegistrationDate() );
        vehicle.setRegistrationState( request.getRegistrationState() );
        vehicle.setRtoOffice( request.getRtoOffice() );
        vehicle.setOwnership( request.getOwnership() );
        vehicle.setSoldFlag( request.getSoldFlag() );
        vehicle.setHypothecation( request.getHypothecation() );
        vehicle.setVehicleGroup( request.getVehicleGroup() );
        vehicle.setGroupId( request.getGroupId() );

        return vehicle;
    }

    @Override
    public void updateEntity(CreateVehicleRequest request, Vehicle vehicle) {
        if ( request == null ) {
            return;
        }

        vehicle.setRegistrationNumber( request.getRegistrationNumber() );
        vehicle.setVehicleCategory( request.getVehicleCategory() );
        vehicle.setMake( request.getMake() );
        vehicle.setModel( request.getModel() );
        vehicle.setYear( request.getYear() );
        vehicle.setMfgMonthYear( request.getMfgMonthYear() );
        vehicle.setChassisNumber( request.getChassisNumber() );
        vehicle.setEngineNumber( request.getEngineNumber() );
        vehicle.setColor( request.getColor() );
        vehicle.setBodyType( request.getBodyType() );
        vehicle.setFuelType( request.getFuelType() );
        vehicle.setAxleConfig( request.getAxleConfig() );
        vehicle.setUlwKg( request.getUlwKg() );
        vehicle.setRlwKg( request.getRlwKg() );
        vehicle.setPayloadCapacityKg( request.getPayloadCapacityKg() );
        vehicle.setSeatingCapacity( request.getSeatingCapacity() );
        vehicle.setHpCc( request.getHpCc() );
        vehicle.setOdometer( request.getOdometer() );
        vehicle.setStatus( request.getStatus() );
        vehicle.setRegistrationDate( request.getRegistrationDate() );
        vehicle.setRegistrationState( request.getRegistrationState() );
        vehicle.setRtoOffice( request.getRtoOffice() );
        vehicle.setOwnership( request.getOwnership() );
        vehicle.setSoldFlag( request.getSoldFlag() );
        vehicle.setHypothecation( request.getHypothecation() );
        vehicle.setVehicleGroup( request.getVehicleGroup() );
        vehicle.setGroupId( request.getGroupId() );
    }

    private UUID vehicleVehicleTypeMasterId(Vehicle vehicle) {
        VehicleTypeMaster vehicleTypeMaster = vehicle.getVehicleTypeMaster();
        if ( vehicleTypeMaster == null ) {
            return null;
        }
        return vehicleTypeMaster.getId();
    }

    private String vehicleVehicleTypeMasterName(Vehicle vehicle) {
        VehicleTypeMaster vehicleTypeMaster = vehicle.getVehicleTypeMaster();
        if ( vehicleTypeMaster == null ) {
            return null;
        }
        return vehicleTypeMaster.getName();
    }

    private UUID vehicleBranchId(Vehicle vehicle) {
        Branch branch = vehicle.getBranch();
        if ( branch == null ) {
            return null;
        }
        return branch.getId();
    }

    private String vehicleBranchName(Vehicle vehicle) {
        Branch branch = vehicle.getBranch();
        if ( branch == null ) {
            return null;
        }
        return branch.getName();
    }

    private UUID vehicleClientId(Vehicle vehicle) {
        Client client = vehicle.getClient();
        if ( client == null ) {
            return null;
        }
        return client.getId();
    }

    private String vehicleClientName(Vehicle vehicle) {
        Client client = vehicle.getClient();
        if ( client == null ) {
            return null;
        }
        return client.getName();
    }

    private UUID vehicleOperatorId(Vehicle vehicle) {
        Contact operator = vehicle.getOperator();
        if ( operator == null ) {
            return null;
        }
        return operator.getId();
    }

    private String vehicleOperatorFirstName(Vehicle vehicle) {
        Contact operator = vehicle.getOperator();
        if ( operator == null ) {
            return null;
        }
        return operator.getFirstName();
    }
}
