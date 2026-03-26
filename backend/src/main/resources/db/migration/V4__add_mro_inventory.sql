CREATE TABLE work_orders (
    id UUID PRIMARY KEY,
    work_order_number VARCHAR(100) UNIQUE NOT NULL,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    status VARCHAR(50) DEFAULT 'OPEN',
    priority VARCHAR(50) DEFAULT 'NORMAL',
    total_cost DECIMAL(15, 2),
    issue_date DATE,
    assigned_to UUID REFERENCES contacts(id),
    branch_id UUID REFERENCES branches(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parts (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    part_number VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    location VARCHAR(255),
    in_stock INT DEFAULT 0,
    min_qty INT DEFAULT 0,
    unit_cost DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);