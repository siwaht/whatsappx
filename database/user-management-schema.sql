-- User Management Schema Extension
-- Add this to the existing schema

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(50) NOT NULL, -- e.g., 'instances', 'contacts', 'messages', 'users'
  action VARCHAR(50) NOT NULL, -- e.g., 'create', 'read', 'update', 'delete', 'manage'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Role Permissions (Many-to-Many)
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role_id),
  INDEX idx_users_active (is_active)
);

-- User Sessions (for NextAuth.js)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  expires TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_sessions_token (session_token),
  INDEX idx_sessions_user (user_id)
);

-- User Instance Access (which instances can a user access)
CREATE TABLE IF NOT EXISTS user_instance_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  instance_name VARCHAR(100) NOT NULL,
  can_read BOOLEAN DEFAULT TRUE,
  can_write BOOLEAN DEFAULT FALSE,
  can_manage BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, instance_name),
  INDEX idx_user_instance (user_id, instance_name)
);

-- Activity Log
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_activity_user (user_id, created_at DESC),
  INDEX idx_activity_action (action, created_at DESC)
);

-- Insert Default Roles
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Super Administrator with full system access'),
  ('admin', 'Administrator with most permissions'),
  ('manager', 'Manager with instance and user management'),
  ('operator', 'Operator with instance operation permissions'),
  ('viewer', 'Read-only access to view data')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Permissions
INSERT INTO permissions (name, resource, action, description) VALUES
  -- User Management
  ('users.create', 'users', 'create', 'Create new users'),
  ('users.read', 'users', 'read', 'View users'),
  ('users.update', 'users', 'update', 'Update user details'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  ('users.manage', 'users', 'manage', 'Full user management'),

  -- Instance Management
  ('instances.create', 'instances', 'create', 'Create instances'),
  ('instances.read', 'instances', 'read', 'View instances'),
  ('instances.update', 'instances', 'update', 'Update instances'),
  ('instances.delete', 'instances', 'delete', 'Delete instances'),
  ('instances.manage', 'instances', 'manage', 'Full instance management'),

  -- Message Management
  ('messages.send', 'messages', 'send', 'Send messages'),
  ('messages.read', 'messages', 'read', 'View messages'),
  ('messages.delete', 'messages', 'delete', 'Delete messages'),

  -- Contact Management
  ('contacts.create', 'contacts', 'create', 'Add contacts'),
  ('contacts.read', 'contacts', 'read', 'View contacts'),
  ('contacts.update', 'contacts', 'update', 'Update contacts'),
  ('contacts.delete', 'contacts', 'delete', 'Delete contacts'),

  -- Group Management
  ('groups.create', 'groups', 'create', 'Create groups'),
  ('groups.read', 'groups', 'read', 'View groups'),
  ('groups.update', 'groups', 'update', 'Update groups'),
  ('groups.delete', 'groups', 'delete', 'Delete groups'),

  -- Webhook Management
  ('webhooks.create', 'webhooks', 'create', 'Create webhooks'),
  ('webhooks.read', 'webhooks', 'read', 'View webhooks'),
  ('webhooks.update', 'webhooks', 'update', 'Update webhooks'),
  ('webhooks.delete', 'webhooks', 'delete', 'Delete webhooks'),

  -- Settings
  ('settings.read', 'settings', 'read', 'View settings'),
  ('settings.update', 'settings', 'update', 'Update settings'),

  -- Analytics
  ('analytics.read', 'analytics', 'read', 'View analytics and reports')
ON CONFLICT (name) DO NOTHING;

-- Assign Permissions to Roles
-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin'
ON CONFLICT DO NOTHING;

-- Admin gets most permissions except user deletion
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
  AND p.name NOT IN ('users.delete', 'users.manage')
ON CONFLICT DO NOTHING;

-- Manager gets instance and basic management
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager'
  AND p.name IN (
    'instances.create', 'instances.read', 'instances.update', 'instances.delete',
    'messages.send', 'messages.read', 'messages.delete',
    'contacts.read', 'contacts.update',
    'groups.read', 'groups.update',
    'webhooks.read', 'webhooks.update',
    'settings.read', 'analytics.read',
    'users.read'
  )
ON CONFLICT DO NOTHING;

-- Operator gets operational permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'operator'
  AND p.name IN (
    'instances.read', 'instances.update',
    'messages.send', 'messages.read',
    'contacts.read', 'contacts.update',
    'groups.read', 'groups.update',
    'analytics.read'
  )
ON CONFLICT DO NOTHING;

-- Viewer gets read-only permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'viewer'
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_instance_access_updated_at BEFORE UPDATE ON user_instance_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create default super admin user (password: admin123 - CHANGE THIS!)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, name, role_id, is_active, is_verified)
SELECT
  'admin@whatsapp-dashboard.local',
  '$2a$10$rQqJZ4Y.YvVXH8YjYqKqZO7YJ9qXqxN5qmQ5XJQqvH5XJQqvH5XJQ',  -- Password: admin123
  'System Administrator',
  (SELECT id FROM roles WHERE name = 'super_admin'),
  TRUE,
  TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@whatsapp-dashboard.local');

-- Create views for user management
CREATE OR REPLACE VIEW v_users_with_roles AS
SELECT
  u.id,
  u.email,
  u.name,
  u.avatar_url,
  u.is_active,
  u.is_verified,
  u.last_login,
  u.created_at,
  r.name as role_name,
  r.description as role_description,
  creator.name as created_by_name
FROM users u
LEFT JOIN roles r ON u.role_id = r.id
LEFT JOIN users creator ON u.created_by = creator.id;

CREATE OR REPLACE VIEW v_user_permissions AS
SELECT
  u.id as user_id,
  u.email,
  p.name as permission_name,
  p.resource,
  p.action
FROM users u
JOIN roles r ON u.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE u.is_active = TRUE;
