-- MySQL Script tạo các bảng chính cho hệ thống khách sạn SaaS (multi-tenant)

-- Bảng tenants
CREATE TABLE tbl_tenants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    subscription_plan_id INT,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL
);

-- Bảng tbl_rooms
CREATE TABLE tbl_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    room_type VARCHAR(100) NOT NULL,
    room_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    capacity_adults INT,
    capacity_children INT,
    size_m2 INT,
    view_type VARCHAR(50),
    has_balcony BOOLEAN,
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    vr360_url VARCHAR(255),
    booking_url VARCHAR(255),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng tiện nghi phòng (Room Amenities)
CREATE TABLE tbl_room_amenities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    amenity_name VARCHAR(100),
    FOREIGN KEY (room_id) REFERENCES tbl_rooms(id) ON DELETE CASCADE
);

-- Bảng đặc điểm phòng (Room Features)
CREATE TABLE tbl_room_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    feature_name VARCHAR(100),
    FOREIGN KEY (room_id) REFERENCES tbl_rooms(id) ON DELETE CASCADE
);

-- Bảng cơ sở vật chất dùng chung (Facilities)
CREATE TABLE tbl_facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    facility_name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- restaurant, spa, gym, pool, etc.
    image_url VARCHAR(255),
    video_url VARCHAR(255),
    vr360_url VARCHAR(255),
    gallery_url VARCHAR(255),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng đặc điểm cho từng facility
CREATE TABLE tbl_facility_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_id INT,
    feature_name VARCHAR(100),
    FOREIGN KEY (facility_id) REFERENCES tbl_facilities(id) ON DELETE CASCADE
);

-- Bảng thương hiệu khách sạn (hotel_brands) - mở rộng đầy đủ thông tin
CREATE TABLE tbl_hotel_brands (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    hotel_name VARCHAR(255) NOT NULL,
    slogan VARCHAR(255),
    description TEXT,
    logo_url VARCHAR(255),
    banner_images JSON,
    intro_video_url VARCHAR(255),
    vr360_url VARCHAR(255),

    address VARCHAR(255),
    district VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    phone_number VARCHAR(50),
    email VARCHAR(100),
    website_url VARCHAR(255),
    zalo_oa_id VARCHAR(50),
    facebook_url VARCHAR(255),
    youtube_url VARCHAR(255),
    tiktok_url VARCHAR(255),
    instagram_url VARCHAR(255),
    google_map_url VARCHAR(512),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),

    primary_color VARCHAR(10),
    secondary_color VARCHAR(10),

    copyright_text VARCHAR(255),
    terms_url VARCHAR(255),
    privacy_url VARCHAR(255),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng yêu cầu đặt phòng/dịch vụ (booking requests)
CREATE TABLE tbl_booking_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    customer_id INT NOT NULL,
    room_id INT,
    facility_id INT,
    mobile_number VARCHAR(20), -- số điện thoại liên hệ khách
    booking_date DATE NOT NULL,
    check_in_date DATE,
    check_out_date DATE,
    note TEXT,
    request_channel VARCHAR(50), -- zalo_chat | external_link
    status VARCHAR(20) DEFAULT 'requested',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng chương trình khuyến mãi
CREATE TABLE tbl_promotions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    title VARCHAR(255),
    description TEXT,
    start_date DATE,
    end_date DATE,
    banner_image VARCHAR(512),
    status VARCHAR(20) DEFAULT 'active',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng voucher đi kèm khuyến mãi
CREATE TABLE tbl_vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    promotion_id INT,
    code VARCHAR(100) UNIQUE,
    discount_type VARCHAR(20), -- percentage | fixed
    discount_value DECIMAL(10,2),
    max_usage INT,
    used_count INT DEFAULT 0,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng gán voucher cho khách hàng
CREATE TABLE tbl_customer_vouchers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    customer_id INT NOT NULL,
    voucher_id INT NOT NULL,
    assigned_date DATETIME NOT NULL,
    used_date DATETIME,
    status VARCHAR(20) DEFAULT 'assigned', -- assigned | used | expired

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng lưu thông tin khách đang lưu trú
CREATE TABLE tbl_room_stays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    customer_id INT NOT NULL,
    room_id INT NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME,
    status VARCHAR(20) DEFAULT 'staying', -- staying/checked_out
    note TEXT,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng dịch vụ
CREATE TABLE tbl_services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- restaurant/spa/transport/other
    image_url VARCHAR(255),
    price DECIMAL(10,2),
    unit VARCHAR(50),
    duration_minutes INT,
    requires_schedule BOOLEAN DEFAULT TRUE,

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng đặt dịch vụ gắn với lưu trú
CREATE TABLE tbl_service_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    customer_id INT NOT NULL,
    service_id INT NOT NULL,
    room_stay_id INT NOT NULL,
    booking_date DATE NOT NULL,
    scheduled_time DATETIME,
    quantity INT DEFAULT 1,
    note TEXT,
    status VARCHAR(20) DEFAULT 'requested',
    mobile_number VARCHAR(20),

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);



-- Bảng customers
CREATE TABLE tbl_customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    zalo_user_id VARCHAR(100) UNIQUE,
    name VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);

-- Bảng games
CREATE TABLE tbl_games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    game_name VARCHAR(100),
    configurations JSON,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,
    INDEX idx_tenant_id (tenant_id)
);
-- Bảng quản trị viên hệ thống và khách sạn (admin_users)
CREATE TABLE tbl_admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT, -- NULL nếu là super_admin toàn hệ thống
    username VARCHAR(100) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role ENUM('super_admin', 'hotel_admin') NOT NULL DEFAULT 'hotel_admin',
    status VARCHAR(20) DEFAULT 'active',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_by VARCHAR(50),
    deleted TINYINT(1) DEFAULT 0,
    deleted_at DATETIME DEFAULT NULL,
    deleted_by VARCHAR(50) DEFAULT NULL,

    INDEX idx_tenant_id (tenant_id)
);
