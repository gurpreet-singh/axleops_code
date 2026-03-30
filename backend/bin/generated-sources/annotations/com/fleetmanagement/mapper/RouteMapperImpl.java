package com.fleetmanagement.mapper;

import com.fleetmanagement.dto.request.CreateRouteRequest;
import com.fleetmanagement.dto.response.RouteResponse;
import com.fleetmanagement.entity.AnnexureType;
import com.fleetmanagement.entity.InvoiceType;
import com.fleetmanagement.entity.LedgerAccount;
import com.fleetmanagement.entity.Route;
import com.fleetmanagement.entity.master.VehicleTypeMaster;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-03-30T10:21:15+0530",
    comments = "version: 1.6.3, compiler: Eclipse JDT (IDE) 3.45.0.v20260224-0835, environment: Java 21.0.10 (Eclipse Adoptium)"
)
@Component
public class RouteMapperImpl implements RouteMapper {

    @Override
    public RouteResponse toResponse(Route route) {
        if ( route == null ) {
            return null;
        }

        RouteResponse routeResponse = new RouteResponse();

        routeResponse.setLedgerAccountId( routeLedgerAccountId( route ) );
        routeResponse.setLedgerAccountName( routeLedgerAccountAccountHead( route ) );
        routeResponse.setInvoiceTypeId( routeInvoiceTypeId( route ) );
        routeResponse.setInvoiceTypeName( routeInvoiceTypeName( route ) );
        routeResponse.setAnnexureTypeId( routeAnnexureTypeId( route ) );
        routeResponse.setAnnexureTypeName( routeAnnexureTypeName( route ) );
        routeResponse.setVehicleTypeId( routeVehicleTypeMasterId( route ) );
        routeResponse.setVehicleTypeName( routeVehicleTypeMasterName( route ) );
        routeResponse.setId( route.getId() );
        routeResponse.setName( route.getName() );
        routeResponse.setOrigin( route.getOrigin() );
        routeResponse.setDestination( route.getDestination() );
        routeResponse.setDistanceKm( route.getDistanceKm() );
        routeResponse.setEstimatedHours( route.getEstimatedHours() );
        routeResponse.setTollCost( route.getTollCost() );
        routeResponse.setVia( route.getVia() );
        routeResponse.setOriginPin( route.getOriginPin() );
        routeResponse.setDestPin( route.getDestPin() );
        routeResponse.setSlaHours( route.getSlaHours() );
        routeResponse.setPaymentTerms( route.getPaymentTerms() );
        routeResponse.setTemplate( route.getTemplate() );
        routeResponse.setStatus( route.getStatus() );
        routeResponse.setBillingType( route.getBillingType() );
        routeResponse.setDocumentSeries( route.getDocumentSeries() );
        routeResponse.setFreightRate( route.getFreightRate() );
        routeResponse.setGdsCharges( route.getGdsCharges() );
        routeResponse.setStCharges( route.getStCharges() );
        routeResponse.setInsurance( route.getInsurance() );
        routeResponse.setLoadingCharges( route.getLoadingCharges() );
        routeResponse.setUnloadingCharges( route.getUnloadingCharges() );
        routeResponse.setDeliveryCharges( route.getDeliveryCharges() );
        routeResponse.setCollectionCharges( route.getCollectionCharges() );
        routeResponse.setDetentionCharges( route.getDetentionCharges() );
        routeResponse.setGodownCharges( route.getGodownCharges() );
        routeResponse.setLrCharges( route.getLrCharges() );
        routeResponse.setOtherCharges( route.getOtherCharges() );
        routeResponse.setDriverExpense( route.getDriverExpense() );
        routeResponse.setDieselLitres( route.getDieselLitres() );
        routeResponse.setLoadingInstructions( route.getLoadingInstructions() );
        routeResponse.setUnloadingInstructions( route.getUnloadingInstructions() );

        return routeResponse;
    }

    @Override
    public Route toEntity(CreateRouteRequest request) {
        if ( request == null ) {
            return null;
        }

        Route route = new Route();

        route.setName( request.getName() );
        route.setOrigin( request.getOrigin() );
        route.setDestination( request.getDestination() );
        route.setDistanceKm( request.getDistanceKm() );
        route.setEstimatedHours( request.getEstimatedHours() );
        route.setTollCost( request.getTollCost() );
        route.setVia( request.getVia() );
        route.setOriginPin( request.getOriginPin() );
        route.setDestPin( request.getDestPin() );
        route.setSlaHours( request.getSlaHours() );
        route.setPaymentTerms( request.getPaymentTerms() );
        route.setTemplate( request.getTemplate() );
        route.setStatus( request.getStatus() );
        route.setBillingType( request.getBillingType() );
        route.setDocumentSeries( request.getDocumentSeries() );
        route.setFreightRate( request.getFreightRate() );
        route.setGdsCharges( request.getGdsCharges() );
        route.setStCharges( request.getStCharges() );
        route.setInsurance( request.getInsurance() );
        route.setLoadingCharges( request.getLoadingCharges() );
        route.setUnloadingCharges( request.getUnloadingCharges() );
        route.setDeliveryCharges( request.getDeliveryCharges() );
        route.setCollectionCharges( request.getCollectionCharges() );
        route.setDetentionCharges( request.getDetentionCharges() );
        route.setGodownCharges( request.getGodownCharges() );
        route.setLrCharges( request.getLrCharges() );
        route.setOtherCharges( request.getOtherCharges() );
        route.setDriverExpense( request.getDriverExpense() );
        route.setDieselLitres( request.getDieselLitres() );
        route.setLoadingInstructions( request.getLoadingInstructions() );
        route.setUnloadingInstructions( request.getUnloadingInstructions() );

        return route;
    }

    @Override
    public void updateEntity(CreateRouteRequest request, Route route) {
        if ( request == null ) {
            return;
        }

        route.setName( request.getName() );
        route.setOrigin( request.getOrigin() );
        route.setDestination( request.getDestination() );
        route.setDistanceKm( request.getDistanceKm() );
        route.setEstimatedHours( request.getEstimatedHours() );
        route.setTollCost( request.getTollCost() );
        route.setVia( request.getVia() );
        route.setOriginPin( request.getOriginPin() );
        route.setDestPin( request.getDestPin() );
        route.setSlaHours( request.getSlaHours() );
        route.setPaymentTerms( request.getPaymentTerms() );
        route.setTemplate( request.getTemplate() );
        route.setStatus( request.getStatus() );
        route.setBillingType( request.getBillingType() );
        route.setDocumentSeries( request.getDocumentSeries() );
        route.setFreightRate( request.getFreightRate() );
        route.setGdsCharges( request.getGdsCharges() );
        route.setStCharges( request.getStCharges() );
        route.setInsurance( request.getInsurance() );
        route.setLoadingCharges( request.getLoadingCharges() );
        route.setUnloadingCharges( request.getUnloadingCharges() );
        route.setDeliveryCharges( request.getDeliveryCharges() );
        route.setCollectionCharges( request.getCollectionCharges() );
        route.setDetentionCharges( request.getDetentionCharges() );
        route.setGodownCharges( request.getGodownCharges() );
        route.setLrCharges( request.getLrCharges() );
        route.setOtherCharges( request.getOtherCharges() );
        route.setDriverExpense( request.getDriverExpense() );
        route.setDieselLitres( request.getDieselLitres() );
        route.setLoadingInstructions( request.getLoadingInstructions() );
        route.setUnloadingInstructions( request.getUnloadingInstructions() );
    }

    private UUID routeLedgerAccountId(Route route) {
        LedgerAccount ledgerAccount = route.getLedgerAccount();
        if ( ledgerAccount == null ) {
            return null;
        }
        return ledgerAccount.getId();
    }

    private String routeLedgerAccountAccountHead(Route route) {
        LedgerAccount ledgerAccount = route.getLedgerAccount();
        if ( ledgerAccount == null ) {
            return null;
        }
        return ledgerAccount.getAccountHead();
    }

    private UUID routeInvoiceTypeId(Route route) {
        InvoiceType invoiceType = route.getInvoiceType();
        if ( invoiceType == null ) {
            return null;
        }
        return invoiceType.getId();
    }

    private String routeInvoiceTypeName(Route route) {
        InvoiceType invoiceType = route.getInvoiceType();
        if ( invoiceType == null ) {
            return null;
        }
        return invoiceType.getName();
    }

    private UUID routeAnnexureTypeId(Route route) {
        AnnexureType annexureType = route.getAnnexureType();
        if ( annexureType == null ) {
            return null;
        }
        return annexureType.getId();
    }

    private String routeAnnexureTypeName(Route route) {
        AnnexureType annexureType = route.getAnnexureType();
        if ( annexureType == null ) {
            return null;
        }
        return annexureType.getName();
    }

    private UUID routeVehicleTypeMasterId(Route route) {
        VehicleTypeMaster vehicleTypeMaster = route.getVehicleTypeMaster();
        if ( vehicleTypeMaster == null ) {
            return null;
        }
        return vehicleTypeMaster.getId();
    }

    private String routeVehicleTypeMasterName(Route route) {
        VehicleTypeMaster vehicleTypeMaster = route.getVehicleTypeMaster();
        if ( vehicleTypeMaster == null ) {
            return null;
        }
        return vehicleTypeMaster.getName();
    }
}
