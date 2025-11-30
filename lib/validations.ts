import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();
const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
  .toLowerCase()
  .trim();
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// Auth schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: z.string().max(50).trim().optional(),
  lastName: z.string().max(50).trim().optional(),
});

// User management schemas
export const createUserSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
  firstName: z.string().max(50).trim().optional(),
  lastName: z.string().max(50).trim().optional(),
  roleIds: z.array(z.number().int().positive()).optional(),
});

export const updateUserSchema = z.object({
  email: emailSchema.optional(),
  username: usernameSchema.optional(),
  password: passwordSchema.optional(),
  firstName: z.string().max(50).trim().optional().nullable(),
  lastName: z.string().max(50).trim().optional().nullable(),
  isActive: z.boolean().optional(),
  roleIds: z.array(z.number().int().positive()).optional(),
});

// Role schemas
export const createRoleSchema = z.object({
  name: z.string()
    .min(2, 'Role name must be at least 2 characters')
    .max(50, 'Role name must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Role name can only contain letters, numbers, underscores, and hyphens')
    .toLowerCase()
    .trim(),
  description: z.string().max(200).trim().optional(),
  permissionIds: z.array(z.number().int().positive()).optional(),
});

export const updateRoleSchema = z.object({
  name: z.string()
    .min(2)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .toLowerCase()
    .trim()
    .optional(),
  description: z.string().max(200).trim().optional().nullable(),
  permissionIds: z.array(z.number().int().positive()).optional(),
});

// Instance schemas
export const createInstanceSchema = z.object({
  instanceName: z.string()
    .min(3, 'Instance name must be at least 3 characters')
    .max(50, 'Instance name must be at most 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Instance name can only contain letters, numbers, underscores, and hyphens')
    .trim(),
});

export const instanceActionSchema = z.object({
  action: z.enum(['restart', 'connect', 'logout']),
});

// Message schemas
export const sendMessageSchema = z.object({
  instanceName: z.string().min(1, 'Instance name is required'),
  number: z.string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number must be at most 20 digits')
    .regex(/^[0-9]+$/, 'Phone number can only contain digits'),
  text: z.string().max(4096).optional(),
  mediaUrl: z.string().url().optional(),
  mediaType: z.enum(['image', 'video', 'document', 'audio']).optional(),
  fileName: z.string().max(255).optional(),
  caption: z.string().max(1024).optional(),
}).refine(
  (data) => data.text || data.mediaUrl,
  { message: 'Either text or mediaUrl is required' }
);

// Webhook schemas
export const webhookConfigSchema = z.object({
  instanceName: z.string().min(1, 'Instance name is required'),
  enabled: z.boolean(),
  url: z.string().url('Invalid webhook URL'),
  events: z.array(z.string()).optional(),
  webhookByEvents: z.boolean().optional(),
});

// Settings schemas
export const instanceSettingsSchema = z.object({
  instanceName: z.string().min(1, 'Instance name is required'),
  rejectCall: z.boolean().optional(),
  alwaysOnline: z.boolean().optional(),
  readMessages: z.boolean().optional(),
  readStatus: z.boolean().optional(),
  syncFullHistory: z.boolean().optional(),
});

// Helper function to validate request body
export async function validateRequest<T>(
  schema: z.Schema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e) => e.message).join(', ');
      return { success: false, error: messages };
    }
    return { success: false, error: 'Validation failed' };
  }
}

// Export types
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreateInstanceInput = z.infer<typeof createInstanceSchema>;
export type InstanceActionInput = z.infer<typeof instanceActionSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type WebhookConfigInput = z.infer<typeof webhookConfigSchema>;
export type InstanceSettingsInput = z.infer<typeof instanceSettingsSchema>;

