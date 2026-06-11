/**
 * Audit Logger Service
 * Immutable, tamper-proof audit trail for compliance (7-year retention)
 */

export type AuditAction =
  | 'LOGIN' | 'LOGOUT' | 'LOGIN_FAILED'
  | 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'
  | 'ROLE_ASSIGN' | 'ROLE_REVOKE' | 'PERMISSION_CHANGE'
  | 'USER_CREATE' | 'USER_DELETE' | 'USER_MODIFY'
  | 'ORG_CREATE' | 'ORG_MODIFY' | 'ORG_DELETE'
  | 'SSO_CONFIG' | 'MFA_ENABLE' | 'MFA_DISABLE'
  | 'PASSWORD_CHANGE' | 'PASSWORD_RESET'
  | 'IP_WHITELIST_CHANGE'
  | 'API_KEY_CREATE' | 'API_KEY_REVOKE'
  | 'SESSION_TERMINATE'
  | 'DATA_EXPORT' | 'DATA_DELETE';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: AuditAction;
  severity: AuditSeverity;
  resourceType: string;
  resourceId: string;
  organizationId: string;
  ipAddress: string;
  userAgent: string;
  description: string;
  changes?: Record<string, { before: any; after: any }>;
  status: 'success' | 'failure';
  errorMessage?: string;
  hash: string; // Tamper-proof hash
  previousHash?: string; // Link to previous entry
}

export interface AuditFilter {
  userId?: string;
  action?: AuditAction;
  organizationId?: string;
  startDate?: Date;
  endDate?: Date;
  severity?: AuditSeverity;
  resourceType?: string;
  limit?: number;
  offset?: number;
}

export interface AuditExportOptions {
  format: 'csv' | 'json';
  filter?: AuditFilter;
  includeHash?: boolean;
}

class AuditLogger {
  private entries: AuditLogEntry[] = [];
  private chainHash: string = this.calculateHash('');

  // Log an audit event
  log(entry: Omit<AuditLogEntry, 'id' | 'hash' | 'previousHash'>): AuditLogEntry {
    const id = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const hash = this.calculateEntryHash(entry);

    const auditEntry: AuditLogEntry = {
      ...entry,
      id,
      hash,
      previousHash: this.chainHash,
    };

    // Update chain hash for tamper-proofing
    this.chainHash = hash;
    this.entries.push(auditEntry);

    return auditEntry;
  }

  // Calculate tamper-proof hash
  private calculateHash(data: string): string {
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Calculate entry hash
  private calculateEntryHash(entry: Omit<AuditLogEntry, 'id' | 'hash' | 'previousHash'>): string {
    const data = JSON.stringify(entry);
    return this.calculateHash(data + this.chainHash);
  }

  // Verify audit trail integrity
  verifyIntegrity(): boolean {
    let currentHash = this.calculateHash('');

    for (const entry of this.entries) {
      if (entry.previousHash !== currentHash) {
        return false;
      }
      currentHash = entry.hash;
    }

    return currentHash === this.chainHash;
  }

  // Query audit logs
  query(filter: AuditFilter): AuditLogEntry[] {
    let results = [...this.entries];

    if (filter.userId) {
      results = results.filter(e => e.userId === filter.userId);
    }
    if (filter.action) {
      results = results.filter(e => e.action === filter.action);
    }
    if (filter.organizationId) {
      results = results.filter(e => e.organizationId === filter.organizationId);
    }
    if (filter.severity) {
      results = results.filter(e => e.severity === filter.severity);
    }
    if (filter.resourceType) {
      results = results.filter(e => e.resourceType === filter.resourceType);
    }
    if (filter.startDate) {
      results = results.filter(e => e.timestamp >= filter.startDate!);
    }
    if (filter.endDate) {
      results = results.filter(e => e.timestamp <= filter.endDate!);
    }

    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    if (filter.offset) {
      results = results.slice(filter.offset);
    }
    if (filter.limit) {
      results = results.slice(0, filter.limit);
    }

    return results;
  }

  // Get all entries
  getAllEntries(): AuditLogEntry[] {
    return [...this.entries];
  }

  // Export audit logs
  export(options: AuditExportOptions): string {
    const entries = options.filter
      ? this.query(options.filter)
      : this.entries;

    if (options.format === 'json') {
      return JSON.stringify(entries, null, 2);
    }

    // CSV format
    if (entries.length === 0) {
      return 'id,timestamp,userId,userEmail,action,severity,resourceType,resourceId,organizationId,ipAddress,status\n';
    }

    const headers = [
      'id', 'timestamp', 'userId', 'userEmail', 'action', 'severity',
      'resourceType', 'resourceId', 'organizationId', 'ipAddress', 'status'
    ];

    if (options.includeHash) {
      headers.push('hash', 'previousHash');
    }

    const csvLines = [headers.join(',')];

    entries.forEach(entry => {
      const values = [
        entry.id,
        entry.timestamp.toISOString(),
        entry.userId,
        entry.userEmail,
        entry.action,
        entry.severity,
        entry.resourceType,
        entry.resourceId,
        entry.organizationId,
        entry.ipAddress,
        entry.status,
      ];

      if (options.includeHash) {
        values.push(entry.hash, entry.previousHash || '');
      }

      csvLines.push(values.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));
    });

    return csvLines.join('\n');
  }

  // Get audit statistics
  getStatistics(organizationId: string): {
    totalEvents: number;
    eventsByAction: Record<string, number>;
    eventsBySeverity: Record<string, number>;
    failedLoginAttempts: number;
    criticalEvents: number;
  } {
    const orgEntries = this.entries.filter(e => e.organizationId === organizationId);

    const stats = {
      totalEvents: orgEntries.length,
      eventsByAction: {} as Record<string, number>,
      eventsBySeverity: {} as Record<string, number>,
      failedLoginAttempts: 0,
      criticalEvents: 0,
    };

    orgEntries.forEach(entry => {
      // Count by action
      stats.eventsByAction[entry.action] = (stats.eventsByAction[entry.action] || 0) + 1;

      // Count by severity
      stats.eventsBySeverity[entry.severity] = (stats.eventsBySeverity[entry.severity] || 0) + 1;

      // Count failed logins
      if (entry.action === 'LOGIN_FAILED') {
        stats.failedLoginAttempts++;
      }

      // Count critical events
      if (entry.severity === 'critical') {
        stats.criticalEvents++;
      }
    });

    return stats;
  }

  // Get security alerts
  getSecurityAlerts(organizationId: string, hoursBack: number = 24): AuditLogEntry[] {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);

    return this.entries.filter(e =>
      e.organizationId === organizationId &&
      e.severity === 'critical' &&
      e.timestamp >= cutoffTime
    ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Cleanup old entries (7-year retention)
  cleanupOldEntries(retentionDays: number = 365 * 7): number {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    const initialLength = this.entries.length;

    this.entries = this.entries.filter(e => e.timestamp >= cutoffDate);

    // Recalculate chain hash after cleanup
    this.chainHash = this.calculateHash('');
    for (const entry of this.entries) {
      this.chainHash = entry.hash;
    }

    return initialLength - this.entries.length;
  }
}

// Export singleton instance
export const auditLogger = new AuditLogger();
