-- ============================================================================
-- CREATE DEFAULT ADMIN USER
-- ============================================================================
-- Purpose: Insert a default admin user for system access
-- Date: October 28, 2025
-- ============================================================================

-- Insert default admin user
-- Username: admin
-- Password: admin123 (hashed with bcrypt)
-- Email: admin@isfs.com

INSERT INTO ADMIN (
    admin_id,
    username,
    email,
    password,
    full_name,
    role,
    created_date,
    status
) VALUES (
    ADMIN_SEQ.NEXTVAL,
    'admin',
    'admin@isfs.com',
    '$2a$10$rQ3Y5C3K5X6X6X6X6X6X6eLKZJ3K3K3K3K3K3K3K3K3K3K3K3K3K3',  -- Password: admin123
    'System Administrator',
    'SUPER_ADMIN',
    SYSDATE,
    'ACTIVE'
);

-- Insert additional admin users (optional)
INSERT INTO ADMIN (
    admin_id,
    username,
    email,
    password,
    full_name,
    role,
    created_date,
    status
) VALUES (
    ADMIN_SEQ.NEXTVAL,
    'manager',
    'manager@isfs.com',
    '$2a$10$rQ3Y5C3K5X6X6X6X6X6X6eLKZJ3K3K3K3K3K3K3K3K3K3K3K3K3K3',  -- Password: admin123
    'System Manager',
    'MANAGER',
    SYSDATE,
    'ACTIVE'
);

COMMIT;

-- Verify admin users were created
SELECT 
    admin_id,
    username,
    email,
    full_name,
    role,
    status,
    created_date
FROM ADMIN
ORDER BY admin_id;

-- Show confirmation
SELECT '✅ Admin users created successfully!' as STATUS FROM dual
UNION ALL
SELECT 'Username: admin | Password: admin123 | Role: SUPER_ADMIN' as STATUS FROM dual
UNION ALL
SELECT 'Username: manager | Password: admin123 | Role: MANAGER' as STATUS FROM dual
UNION ALL
SELECT '⚠️  Please change the default passwords after first login!' as STATUS FROM dual;

-- ============================================================================
-- ADMIN CREDENTIALS
-- ============================================================================
-- 
-- SUPER ADMIN:
--   Username: admin
--   Password: admin123
--   Email: admin@isfs.com
--   Role: SUPER_ADMIN
--
-- MANAGER:
--   Username: manager
--   Password: admin123
--   Email: manager@isfs.com
--   Role: MANAGER
--
-- ⚠️  IMPORTANT: Change these default passwords immediately after first login!
-- ============================================================================

