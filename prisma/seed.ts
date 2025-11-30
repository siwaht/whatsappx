import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const RESOURCES = ['instances', 'messages', 'contacts', 'webhooks', 'users', 'settings', 'roles'];
const ACTIONS = ['create', 'read', 'update', 'delete', 'manage'];

async function main() {
  console.log('🌱 Starting database seed...');

  // Create permissions
  console.log('Creating permissions...');
  const permissions = [];
  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const permission = await prisma.permission.upsert({
        where: { name: `${resource}:${action}` },
        update: {},
        create: {
          name: `${resource}:${action}`,
          resource,
          action,
          description: `Can ${action} ${resource}`,
        },
      });
      permissions.push(permission);
    }
  }
  console.log(`✅ Created ${permissions.length} permissions`);

  // Create roles
  console.log('Creating roles...');
  
  // Admin role - full access
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {},
    create: {
      name: 'admin',
      description: 'Administrator with full access to all features',
    },
  });

  // Assign all permissions to admin
  for (const permission of permissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Operator role - can manage instances and messages
  const operatorRole = await prisma.role.upsert({
    where: { name: 'operator' },
    update: {},
    create: {
      name: 'operator',
      description: 'Can manage WhatsApp instances and send messages',
    },
  });

  const operatorPermissions = permissions.filter(
    (p) =>
      ['instances', 'messages', 'contacts'].includes(p.resource) &&
      ['create', 'read', 'update'].includes(p.action)
  );
  for (const permission of operatorPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: operatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: operatorRole.id,
        permissionId: permission.id,
      },
    });
  }

  // Viewer role - read-only access
  const viewerRole = await prisma.role.upsert({
    where: { name: 'viewer' },
    update: {},
    create: {
      name: 'viewer',
      description: 'Read-only access to dashboard and data',
    },
  });

  const viewerPermissions = permissions.filter(
    (p) =>
      ['instances', 'messages', 'contacts', 'webhooks'].includes(p.resource) &&
      p.action === 'read'
  );
  for (const permission of viewerPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: viewerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: viewerRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Created roles: admin, operator, viewer');

  // Create default admin user if it doesn't exist
  const adminEmail = process.env.ADMIN_EMAIL || 'cc@siwaht.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Hola173!';
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    console.log('Creating default admin user...');
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    
    const adminUser = await prisma.user.create({
      data: {
        email: adminEmail,
        username: adminUsername,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isActive: true,
      },
    });

    await prisma.userRole.create({
      data: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });

    console.log(`✅ Created admin user: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ⚠️  Please change the password after first login!');
  } else {
    console.log('ℹ️  Admin user already exists, skipping...');
  }

  // Clean up expired sessions
  console.log('Cleaning up expired sessions...');
  const deletedSessions = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
  console.log(`✅ Cleaned up ${deletedSessions.count} expired sessions`);

  // Clean up old rate limit entries
  console.log('Cleaning up old rate limit entries...');
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const deletedRateLimits = await prisma.rateLimitEntry.deleteMany({
    where: {
      windowStart: {
        lt: oneHourAgo,
      },
    },
  });
  console.log(`✅ Cleaned up ${deletedRateLimits.count} old rate limit entries`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

