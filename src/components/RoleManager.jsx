/**
 * Role Manager Component
 * Manage RBAC roles, permissions, and custom role creation
 */

import React, { useState } from 'react';

export const RoleManager = ({ organizationId = 'org_demo', onRoleChange = () => {} }) => {
  const [activeTab, setActiveTab] = useState('roles');
  const [roles, setRoles] = useState([
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access with all permissions',
      permissionCount: 30,
      userCount: 1,
      isCustom: false,
    },
    {
      id: 'admin',
      name: 'Administrator',
      description: 'Administrative access to organization',
      permissionCount: 25,
      userCount: 2,
      isCustom: false,
    },
    {
      id: 'manager',
      name: 'Manager',
      description: 'Team management and content creation',
      permissionCount: 15,
      userCount: 5,
      isCustom: false,
    },
    {
      id: 'member',
      name: 'Member',
      description: 'Content creation and collaboration',
      permissionCount: 8,
      userCount: 25,
      isCustom: false,
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access',
      permissionCount: 3,
      userCount: 50,
      isCustom: false,
    },
  ]);

  const [customRoles, setCustomRoles] = useState([
    {
      id: 'custom_analyst',
      name: 'Data Analyst',
      description: 'Custom role for data analysis tasks',
      permissionCount: 12,
      userCount: 3,
      isCustom: true,
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPermissionMatrix, setShowPermissionMatrix] = useState(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [],
  });

  const allRoles = [...roles, ...customRoles];

  const permissionCategories = {
    user_management: ['user:create', 'user:edit', 'user:delete', 'user:view', 'user:manage_roles'],
    role_management: ['role:create', 'role:edit', 'role:delete', 'role:view'],
    organization: ['org:edit', 'org:settings', 'org:billing', 'org:delete'],
    content: ['content:create', 'content:edit', 'content:delete', 'content:publish', 'content:view'],
    compliance: ['audit:view', 'audit:export', 'compliance:view'],
    security: ['security:manage_mfa', 'security:manage_sso', 'security:manage_ip_whitelist', 'security:manage_sessions'],
    integration: ['api:manage_keys', 'api:view_logs'],
  };

  const permissionNames = {
    'user:create': 'Create Users',
    'user:edit': 'Edit Users',
    'user:delete': 'Delete Users',
    'user:view': 'View Users',
    'user:manage_roles': 'Manage User Roles',
    'role:create': 'Create Roles',
    'role:edit': 'Edit Roles',
    'role:delete': 'Delete Roles',
    'role:view': 'View Roles',
    'org:edit': 'Edit Organization',
    'org:settings': 'Manage Organization Settings',
    'org:billing': 'Manage Billing',
    'org:delete': 'Delete Organization',
    'content:create': 'Create Content',
    'content:edit': 'Edit Content',
    'content:delete': 'Delete Content',
    'content:publish': 'Publish Content',
    'content:view': 'View Content',
    'audit:view': 'View Audit Logs',
    'audit:export': 'Export Audit Logs',
    'compliance:view': 'View Compliance Reports',
    'security:manage_mfa': 'Manage MFA',
    'security:manage_sso': 'Manage SSO',
    'security:manage_ip_whitelist': 'Manage IP Whitelist',
    'security:manage_sessions': 'Manage Sessions',
    'api:manage_keys': 'Manage API Keys',
    'api:view_logs': 'View API Logs',
  };

  const handleCreateRole = () => {
    if (newRole.name && newRole.permissions.length > 0) {
      const customRole = {
        id: `custom_${Date.now()}`,
        name: newRole.name,
        description: newRole.description,
        permissionCount: newRole.permissions.length,
        userCount: 0,
        isCustom: true,
      };

      setCustomRoles([...customRoles, customRole]);
      setNewRole({ name: '', description: '', permissions: [] });
      setShowCreateModal(false);
      onRoleChange(customRole);
    }
  };

  const handlePermissionToggle = (permission) => {
    setNewRole({
      ...newRole,
      permissions: newRole.permissions.includes(permission)
        ? newRole.permissions.filter(p => p !== permission)
        : [...newRole.permissions, permission],
    });
  };

  const getRiskLevel = (permission) => {
    const riskMap = {
      'user:delete': 'critical',
      'org:delete': 'critical',
      'org:billing': 'critical',
      'security:manage_sso': 'critical',
      'org:settings': 'critical',
      'user:create': 'high',
      'user:manage_roles': 'high',
      'role:create': 'high',
      'role:edit': 'high',
      'content:delete': 'high',
      'security:manage_mfa': 'high',
      'security:manage_ip_whitelist': 'high',
    };
    return riskMap[permission] || 'medium';
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      critical: 'text-red-600 bg-red-50',
      high: 'text-orange-600 bg-orange-50',
      medium: 'text-yellow-600 bg-yellow-50',
      low: 'text-green-600 bg-green-50',
    };
    return colors[riskLevel] || colors.low;
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Header */}
      <div className="px-6 py-4 border-b flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Role Management</h2>
          <p className="text-sm text-gray-600 mt-1">Configure roles and permissions for your organization</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create Custom Role
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'roles'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          All Roles
        </button>
        <button
          onClick={() => setActiveTab('permissions')}
          className={`px-6 py-3 text-sm font-medium ${
            activeTab === 'permissions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Permissions
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {/* Default Roles */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Roles</h3>
              <div className="grid gap-4">
                {roles.map(role => (
                  <div
                    key={role.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => setShowPermissionMatrix(role.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{role.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                        <div className="flex gap-4 mt-3 text-sm">
                          <span className="text-gray-600">
                            <span className="font-medium text-gray-900">{role.permissionCount}</span> permissions
                          </span>
                          <span className="text-gray-600">
                            <span className="font-medium text-gray-900">{role.userCount}</span> users
                          </span>
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        Built-in
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Roles */}
            {customRoles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Custom Roles</h3>
                <div className="grid gap-4">
                  {customRoles.map(role => (
                    <div
                      key={role.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                      onClick={() => setShowPermissionMatrix(role.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{role.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                          <div className="flex gap-4 mt-3 text-sm">
                            <span className="text-gray-600">
                              <span className="font-medium text-gray-900">{role.permissionCount}</span> permissions
                            </span>
                            <span className="text-gray-600">
                              <span className="font-medium text-gray-900">{role.userCount}</span> users
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                            Edit
                          </button>
                          <button className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'permissions' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Permission Categories</h3>
              <p className="text-sm text-blue-800">
                {Object.keys(permissionCategories).length} categories with {Object.values(permissionCategories).flat().length} total permissions
              </p>
            </div>

            {Object.entries(permissionCategories).map(([category, permissions]) => (
              <div key={category}>
                <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                  {category.replace('_', ' ')}
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {permissions.map(perm => (
                    <div key={perm} className={`p-3 rounded-lg border ${getRiskColor(getRiskLevel(perm))}`}>
                      <div className="font-medium text-sm">{permissionNames[perm]}</div>
                      <div className="text-xs mt-1 opacity-75">
                        Risk: {getRiskLevel(perm)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Role Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Create Custom Role</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Role Name */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Role Name</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g., Content Manager"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={newRole.description}
                  onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe the purpose of this role"
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-4">Select Permissions</label>
                <div className="space-y-4">
                  {Object.entries(permissionCategories).map(([category, permissions]) => (
                    <div key={category}>
                      <h5 className="font-medium text-gray-700 mb-2 capitalize">
                        {category.replace('_', ' ')}
                      </h5>
                      <div className="grid grid-cols-2 gap-3">
                        {permissions.map(perm => (
                          <label key={perm} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newRole.permissions.includes(perm)}
                              onChange={() => handlePermissionToggle(perm)}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">{permissionNames[perm]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Permissions Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-medium text-gray-900 mb-2">Selected Permissions</h5>
                <p className="text-sm text-gray-600 mb-3">{newRole.permissions.length} permissions selected</p>
                <div className="flex flex-wrap gap-2">
                  {newRole.permissions.map(perm => (
                    <span key={perm} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {permissionNames[perm]}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRole}
                  disabled={!newRole.name || newRole.permissions.length === 0}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  Create Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permission Matrix Modal */}
      {showPermissionMatrix && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-900">Permission Matrix</h3>
              <button
                onClick={() => setShowPermissionMatrix(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(permissionCategories).map(([category, permissions]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-gray-900 mb-3 capitalize">
                      {category.replace('_', ' ')}
                    </h4>
                    <div className="space-y-2">
                      {permissions.map(perm => (
                        <div key={perm} className="flex items-center gap-2">
                          <input type="checkbox" readOnly checked className="w-4 h-4" />
                          <span className="text-sm text-gray-700">{permissionNames[perm]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
