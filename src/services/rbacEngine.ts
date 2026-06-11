/**
 * RBAC (Role-Based Access Control) Engine
 * Manages roles, permissions, and access control for enterprise organizations
 */

export type RoleType = 'super_admin' | 'admin' | 'manager' | 'member' | 'viewer' | 'custom';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface Role {
  id: string;
  name: string;
  type: RoleType;
  description: string;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
  isCustom: boolean;
  organizationId: string;
}

export interface RoleAssignment {
  id: string;
  userId: string;
  roleId: string;
  organizationId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
}

export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
  requiredPermission: string;
  userRole: string;
}

// Granular permissions (30+)
const DEFAULT_PERMISSIONS: Record<string, Permission> = {
  // User Management
  'user:create': {
    id: 'user:create',
    name: 'Create Users',
    description: 'Create new users in the organization',
    category: 'user_management',
    riskLevel: 'high',
  },
  'user:edit': {
    id: 'user:edit',
    name: 'Edit Users',
    description: 'Modify user profiles and information',
    category: 'user_management',
    riskLevel: 'medium',
  },
  'user:delete': {
    id: 'user:delete',
    name: 'Delete Users',
    description: 'Remove users from the organization',
    category: 'user_management',
    riskLevel: 'critical',
  },
  'user:view': {
    id: 'user:view',
    name: 'View Users',
    description: 'View user information',
    category: 'user_management',
    riskLevel: 'low',
  },
  'user:manage_roles': {
    id: 'user:manage_roles',
    name: 'Manage User Roles',
    description: 'Assign and revoke roles',
    category: 'user_management',
    riskLevel: 'high',
  },

  // Role Management
  'role:create': {
    id: 'role:create',
    name: 'Create Roles',
    description: 'Create new custom roles',
    category: 'role_management',
    riskLevel: 'high',
  },
  'role:edit': {
    id: 'role:edit',
    name: 'Edit Roles',
    description: 'Modify role permissions and properties',
    category: 'role_management',
    riskLevel: 'high',
  },
  'role:delete': {
    id: 'role:delete',
    name: 'Delete Roles',
    description: 'Delete custom roles',
    category: 'role_management',
    riskLevel: 'critical',
  },
  'role:view': {
    id: 'role:view',
    name: 'View Roles',
    description: 'View role configurations',
    category: 'role_management',
    riskLevel: 'low',
  },

  // Organization Management
  'org:edit': {
    id: 'org:edit',
    name: 'Edit Organization',
    description: 'Modify organization settings',
    category: 'organization',
    riskLevel: 'high',
  },
  'org:settings': {
    id: 'org:settings',
    name: 'Manage Organization Settings',
    description: 'Configure organization settings and policies',
    category: 'organization',
    riskLevel: 'critical',
  },
  'org:billing': {
    id: 'org:billing',
    name: 'Manage Billing',
    description: 'Access and modify billing information',
    category: 'organization',
    riskLevel: 'critical',
  },
  'org:delete': {
    id: 'org:delete',
    name: 'Delete Organization',
    description: 'Permanently delete organization',
    category: 'organization',
    riskLevel: 'critical',
  },

  // Content Management
  'content:create': {
    id: 'content:create',
    name: 'Create Content',
    description: 'Create new content items',
    category: 'content',
    riskLevel: 'medium',
  },
  'content:edit': {
    id: 'content:edit',
    name: 'Edit Content',
    description: 'Modify existing content',
    category: 'content',
    riskLevel: 'medium',
  },
  'content:delete': {
    id: 'content:delete',
    name: 'Delete Content',
    description: 'Delete content items',
    category: 'content',
    riskLevel: 'high',
  },
  'content:publish': {
    id: 'content:publish',
    name: 'Publish Content',
    description: 'Publish content to live environments',
    category: 'content',
    riskLevel: 'high',
  },
  'content:view': {
    id: 'content:view',
    name: 'View Content',
    description: 'Access content items',
    category: 'content',
    riskLevel: 'low',
  },

  // Audit & Compliance
  'audit:view': {
    id: 'audit:view',
    name: 'View Audit Logs',
    description: 'Access audit trail and activity logs',
    category: 'compliance',
    riskLevel: 'high',
  },
  'audit:export': {
    id: 'audit:export',
    name: 'Export Audit Logs',
    description: 'Export audit logs for compliance',
    category: 'compliance',
    riskLevel: 'high',
  },
  'compliance:view': {
    id: 'compliance:view',
    name: 'View Compliance Reports',
    description: 'View compliance and security reports',
    category: 'compliance',
    riskLevel: 'medium',
  },

  // Security
  'security:manage_mfa': {
    id: 'security:manage_mfa',
    name: 'Manage MFA',
    description: 'Configure multi-factor authentication',
    category: 'security',
    riskLevel: 'high',
  },
  'security:manage_sso': {
    id: 'security:manage_sso',
    name: 'Manage SSO',
    description: 'Configure SSO and authentication methods',
    category: 'security',
    riskLevel: 'critical',
  },
  'security:manage_ip_whitelist': {
    id: 'security:manage_ip_whitelist',
    name: 'Manage IP Whitelist',
    description: 'Configure IP restrictions',
    category: 'security',
    riskLevel: 'high',
  },
  'security:manage_sessions': {
    id: 'security:manage_sessions',
    name: 'Manage Sessions',
    description: 'View and terminate user sessions',
    category: 'security',
    riskLevel: 'high',
  },

  // API & Integration
  'api:manage_keys': {
    id: 'api:manage_keys',
    name: 'Manage API Keys',
    description: 'Create and revoke API keys',
    category: 'integration',
    riskLevel: 'high',
  },
  'api:view_logs': {
    id: 'api:view_logs',
    name: 'View API Logs',
    description: 'Access API activity logs',
    category: 'integration',
    riskLevel: 'medium',
  },
};

// Default role definitions
const DEFAULT_ROLES: Record<string, Role> = {
  super_admin: {
    id: 'super_admin',
    name: 'Super Admin',
    type: 'super_admin',
    description: 'Full system access with all permissions',
    permissions: Object.keys(DEFAULT_PERMISSIONS),
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false,
    organizationId: 'system',
  },
  admin: {
    id: 'admin',
    name: 'Administrator',
    type: 'admin',
    description: 'Administrative access to organization',
    permissions: [
      'user:create', 'user:edit', 'user:delete', 'user:view', 'user:manage_roles',
      'role:view', 'org:edit', 'org:settings', 'org:billing',
      'content:create', 'content:edit', 'content:delete', 'content:publish', 'content:view',
      'audit:view', 'audit:export', 'compliance:view',
      'security:manage_mfa', 'security:manage_sso', 'security:manage_ip_whitelist', 'security:manage_sessions',
      'api:manage_keys', 'api:view_logs',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false,
    organizationId: 'system',
  },
  manager: {
    id: 'manager',
    name: 'Manager',
    type: 'manager',
    description: 'Team management and content creation',
    permissions: [
      'user:view', 'user:manage_roles',
      'role:view',
      'content:create', 'content:edit', 'content:delete', 'content:publish', 'content:view',
      'audit:view', 'compliance:view',
      'api:view_logs',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false,
    organizationId: 'system',
  },
  member: {
    id: 'member',
    name: 'Member',
    type: 'member',
    description: 'Content creation and collaboration',
    permissions: [
      'user:view',
      'content:create', 'content:edit', 'content:view',
      'api:view_logs',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false,
    organizationId: 'system',
  },
  viewer: {
    id: 'viewer',
    name: 'Viewer',
    type: 'viewer',
    description: 'Read-only access',
    permissions: [
      'user:view',
      'content:view',
      'role:view',
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    isCustom: false,
    organizationId: 'system',
  },
};

export class RBACEngine {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private roleAssignments: Map<string, RoleAssignment> = new Map();

  constructor() {
    this.initializeDefaults();
  }

  private initializeDefaults(): void {
    Object.values(DEFAULT_PERMISSIONS).forEach((perm) => {
      this.permissions.set(perm.id, perm);
    });

    Object.values(DEFAULT_ROLES).forEach((role) => {
      this.roles.set(role.id, { ...role });
    });
  }

  // Check if a user has a specific permission
  hasPermission(userId: string, permission: string, organizationId: string): PermissionCheck {
    const assignment = this.getUserRoleAssignment(userId, organizationId);

    if (!assignment) {
      return {
        allowed: false,
        reason: 'No role assignment found',
        requiredPermission: permission,
        userRole: 'none',
      };
    }

    const role = this.roles.get(assignment.roleId);
    if (!role) {
      return {
        allowed: false,
        reason: 'Role not found',
        requiredPermission: permission,
        userRole: 'unknown',
      };
    }

    const hasPermission = role.permissions.includes(permission);
    return {
      allowed: hasPermission,
      reason: hasPermission ? undefined : `Permission '${permission}' not granted for role '${role.name}'`,
      requiredPermission: permission,
      userRole: role.name,
    };
  }

  // Create a custom role
  createCustomRole(
    name: string,
    description: string,
    permissions: string[],
    organizationId: string
  ): Role {
    const roleId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const role: Role = {
      id: roleId,
      name,
      type: 'custom',
      description,
      permissions: permissions.filter(p => this.permissions.has(p)),
      createdAt: new Date(),
      updatedAt: new Date(),
      isCustom: true,
      organizationId,
    };

    this.roles.set(roleId, role);
    return role;
  }

  // Update a role's permissions
  updateRolePermissions(roleId: string, permissions: string[]): Role | null {
    const role = this.roles.get(roleId);
    if (!role || !role.isCustom) {
      return null;
    }

    role.permissions = permissions.filter(p => this.permissions.has(p));
    role.updatedAt = new Date();
    this.roles.set(roleId, role);
    return role;
  }

  // Assign role to user
  assignRole(userId: string, roleId: string, organizationId: string, assignedBy: string): RoleAssignment {
    if (!this.roles.has(roleId)) {
      throw new Error(`Role ${roleId} not found`);
    }

    const assignmentId = `ra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const assignment: RoleAssignment = {
      id: assignmentId,
      userId,
      roleId,
      organizationId,
      assignedBy,
      assignedAt: new Date(),
    };

    this.roleAssignments.set(assignmentId, assignment);
    return assignment;
  }

  // Revoke role from user
  revokeRole(userId: string, organizationId: string): boolean {
    for (const [id, assignment] of this.roleAssignments.entries()) {
      if (assignment.userId === userId && assignment.organizationId === organizationId) {
        this.roleAssignments.delete(id);
        return true;
      }
    }
    return false;
  }

  // Get user's current role assignment
  private getUserRoleAssignment(userId: string, organizationId: string): RoleAssignment | null {
    for (const assignment of this.roleAssignments.values()) {
      if (assignment.userId === userId && assignment.organizationId === organizationId) {
        if (!assignment.expiresAt || assignment.expiresAt > new Date()) {
          return assignment;
        }
      }
    }
    return null;
  }

  // Get role details
  getRole(roleId: string): Role | null {
    return this.roles.get(roleId) || null;
  }

  // List all available permissions
  getAllPermissions(): Permission[] {
    return Array.from(this.permissions.values());
  }

  // Get permissions by category
  getPermissionsByCategory(category: string): Permission[] {
    return Array.from(this.permissions.values()).filter(p => p.category === category);
  }

  // Get permission matrix for a role
  getPermissionMatrix(roleId: string): Record<string, string[]> {
    const role = this.roles.get(roleId);
    if (!role) return {};

    const matrix: Record<string, string[]> = {};
    role.permissions.forEach(permId => {
      const perm = this.permissions.get(permId);
      if (perm) {
        if (!matrix[perm.category]) {
          matrix[perm.category] = [];
        }
        matrix[perm.category].push(permId);
      }
    });

    return matrix;
  }

  // Get all roles
  getAllRoles(): Role[] {
    return Array.from(this.roles.values());
  }

  // Get organization roles
  getOrganizationRoles(organizationId: string): Role[] {
    return Array.from(this.roles.values()).filter(
      r => r.organizationId === 'system' || r.organizationId === organizationId
    );
  }
}

// Export singleton instance
export const rbacEngine = new RBACEngine();
