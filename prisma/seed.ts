import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const permissions = [
    { name: 'instances.create', resource: 'instances', action: 'create', description: 'Create WhatsApp instances' },
    { name: 'instances.read', resource: 'instances', action: 'read', description: 'View WhatsApp instances' },
    { name: 'instances.update', resource: 'instances', action: 'update', description: 'Update WhatsApp instances' },
    { name: 'instances.delete', resource: 'instances', action: 'delete', description: 'Delete WhatsApp instances' },
    { name: 'messages.create', resource: 'messages', action: 'create', description: 'Send messages' },
    { name: 'messages.read', resource: 'messages', action: 'read', description: 'View messages' },
    { name: 'contacts.create', resource: 'contacts', action: 'create', description: 'Create contacts' },
    { name: 'contacts.read', resource: 'contacts', action: 'read', description: 'View contacts' },
    { name: 'contacts.update', resource: 'contacts', action: 'update', description: 'Update contacts' },
    { name: 'contacts.delete', resource: 'contacts', action: 'delete', description: 'Delete contacts' },
    { name: 'webhooks.create', resource: 'webhooks', action: 'create', description: 'Create webhooks' },
    { name: 'webhooks.read', resource: 'webhooks', action: 'read', description: 'View webhooks' },
    { name: 'webhooks.update', resource: 'webhooks', action: 'update', description: 'Update webhooks' },
    { name: 'webhooks.delete', resource: 'webhooks', action: 'delete', description: 'Delete webhooks' },
    { name: 'users.create', resource: 'users', action: 'create', description: 'Create users' },
    { name: 'users.read', resource: 'users', action: 'read', description: 'View users' },
    { name: 'users.update', resource: 'users', action: 'update', description: 'Update users' },
    { name: 'users.delete', resource: 'users', action: 'delete', description: 'Delete users' },
    { name: 'roles.manage', resource: 'roles', action: 'manage', description: 'Manage roles and permissions' },
    { name: 'broadcasts.create', resource: 'broadcasts', action: 'create', description: 'Create broadcasts' },
    { name: 'broadcasts.read', resource: 'broadcasts', action: 'read', description: 'View broadcasts' },
    { name: 'broadcasts.update', resource: 'broadcasts', action: 'update', description: 'Update broadcasts' },
    { name: 'broadcasts.delete', resource: 'broadcasts', action: 'delete', description: 'Delete broadcasts' },
    { name: 'aiagents.create', resource: 'aiagents', action: 'create', description: 'Create AI agents' },
    { name: 'aiagents.read', resource: 'aiagents', action: 'read', description: 'View AI agents' },
    { name: 'aiagents.update', resource: 'aiagents', action: 'update', description: 'Update AI agents' },
    { name: 'aiagents.delete', resource: 'aiagents', action: 'delete', description: 'Delete AI agents' },
    { name: 'tools.create', resource: 'tools', action: 'create', description: 'Create tools' },
    { name: 'tools.read', resource: 'tools', action: 'read', description: 'View tools' },
    { name: 'tools.update', resource: 'tools', action: 'update', description: 'Update tools' },
    { name: 'tools.delete', resource: 'tools', action: 'delete', description: 'Delete tools' },
  ];

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission,
    });
  }
  console.log('Permissions created');

  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: { description: 'Full system access' },
    create: {
      name: 'admin',
      description: 'Full system access',
    },
  });
  console.log('Admin role created');

  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
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
  console.log('Admin role permissions assigned');

  const hashedPassword = await bcrypt.hash('Hola173!', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'cc@siwaht.com' },
    update: {
      password: hashedPassword,
    },
    create: {
      email: 'cc@siwaht.com',
      username: 'admin',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isActive: true,
    },
  });
  console.log('Admin user created:', adminUser.email);

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  });
  console.log('Admin role assigned to user');

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
