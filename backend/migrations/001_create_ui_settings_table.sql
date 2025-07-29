-- Migration: Create ui_settings table
-- Date: 2024-01-01
-- Description: Tạo bảng ui_settings để lưu cấu hình giao diện cho từng tenant

-- Chọn database
USE zalo;

CREATE TABLE IF NOT EXISTS ui_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id INT NOT NULL,
    background_color VARCHAR(7) DEFAULT '#ffffff' COMMENT 'Màu nền chính (hex format)',
    primary_color VARCHAR(7) DEFAULT '#1890ff' COMMENT 'Màu chủ đạo (hex format)',
    secondary_color VARCHAR(7) DEFAULT '#f0f0f0' COMMENT 'Màu phụ (hex format)',
    text_color VARCHAR(7) DEFAULT '#000000' COMMENT 'Màu chữ chính (hex format)',
    font_family VARCHAR(100) DEFAULT 'Inter, sans-serif' COMMENT 'Font chữ',
    logo_url TEXT COMMENT 'URL logo của tenant',
    theme_mode ENUM('light', 'dark', 'auto') DEFAULT 'light' COMMENT 'Chế độ theme',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    UNIQUE KEY uk_tenant_id (tenant_id),
    INDEX idx_tenant_id (tenant_id),
    INDEX idx_theme_mode (theme_mode),
    INDEX idx_created_at (created_at),
    INDEX idx_updated_at (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng cấu hình giao diện UI cho từng tenant';

-- Thêm foreign key constraint nếu có bảng merchants/tenants
-- ALTER TABLE ui_settings ADD CONSTRAINT fk_ui_settings_tenant_id 
-- FOREIGN KEY (tenant_id) REFERENCES merchants(id) ON DELETE CASCADE;

-- Insert default UI settings cho một số tenant mẫu
INSERT INTO ui_settings (tenant_id, background_color, primary_color, secondary_color, text_color, font_family, theme_mode) VALUES
(1, '#ffffff', '#1890ff', '#f0f0f0', '#000000', 'Inter, sans-serif', 'light'),
(2, '#f8f9fa', '#52c41a', '#e6f7ff', '#262626', 'Roboto, sans-serif', 'light'),
(3, '#1f1f1f', '#722ed1', '#434343', '#ffffff', 'Open Sans, sans-serif', 'dark')
ON DUPLICATE KEY UPDATE
background_color = VALUES(background_color),
primary_color = VALUES(primary_color),
secondary_color = VALUES(secondary_color),
text_color = VALUES(text_color),
font_family = VALUES(font_family),
theme_mode = VALUES(theme_mode),
updated_at = CURRENT_TIMESTAMP;
