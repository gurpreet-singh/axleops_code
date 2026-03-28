-- ============================================
-- V6: Add trip/vehicle/driver columns to vouchers
-- ============================================

ALTER TABLE vouchers ADD COLUMN trip_id UUID REFERENCES trips(id);
ALTER TABLE vouchers ADD COLUMN vehicle_id UUID REFERENCES vehicles(id);
ALTER TABLE vouchers ADD COLUMN driver_id UUID REFERENCES contacts(id);

-- Rename voucher_type to type for consistency with entity
-- Actually the entity uses 'type', column is 'voucher_type' — keep DB as is, entity maps it.
