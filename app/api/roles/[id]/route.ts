import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/middleware';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return authResult.response;
    }

    const roleId = parseInt(params.id);
    const body = await request.json();
    const { name, description, permissionIds } = body;

    // Check if role exists
    const existingRole = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Update role
    const role = await db.role.update({
      where: { id: roleId },
      data: {
        name: name !== undefined ? name : undefined,
        description: description !== undefined ? description : null,
      },
    });

    // Update permissions if provided
    if (permissionIds !== undefined) {
      // Delete existing permissions
      await db.rolePermission.deleteMany({
        where: { roleId },
      });

      // Add new permissions
      if (permissionIds.length > 0) {
        await db.rolePermission.createMany({
          data: permissionIds.map((permissionId: number) => ({
            roleId,
            permissionId,
          })),
        });
      }
    }

    // Fetch updated role with permissions
    const updatedRole = await db.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedRole!.id,
        name: updatedRole!.name,
        description: updatedRole!.description,
        permissions: updatedRole!.rolePermissions.map(rp => ({
          id: rp.permission.id,
          resource: rp.permission.resource,
          action: rp.permission.action,
        })),
      },
    });
  } catch (error) {
    console.error('Update role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult.response) {
      return authResult.response;
    }

    const roleId = parseInt(params.id);

    // Check if role exists
    const role = await db.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      return NextResponse.json(
        { error: 'Role not found' },
        { status: 404 }
      );
    }

    // Prevent deletion of admin role
    if (role.name === 'admin' || role.name === 'superadmin') {
      return NextResponse.json(
        { error: 'Cannot delete admin roles' },
        { status: 400 }
      );
    }

    // Delete role (cascade will delete related records)
    await db.role.delete({
      where: { id: roleId },
    });

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('Delete role error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

