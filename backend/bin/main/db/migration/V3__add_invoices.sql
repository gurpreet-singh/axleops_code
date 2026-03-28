CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    client_id UUID NOT NULL REFERENCES clients(id),
    date DATE NOT NULL,
    due_date DATE,
    amount DECIMAL(15, 2) NOT NULL,
    gst_amount DECIMAL(15, 2),
    total_amount DECIMAL(15, 2),
    status VARCHAR(50) DEFAULT 'DRAFT',
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE trips ADD COLUMN invoice_id UUID REFERENCES invoices(id);