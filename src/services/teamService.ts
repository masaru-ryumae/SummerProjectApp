/**
 * Team Service - Handles team/organization management
 * Provides CRUD operations for teams, members, departments, and activity logging
 */

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'lead' | 'member';
  department?: string;
  avatar?: string;
  joinedAt: string;
  lastActive?: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  owner: string;
  members: TeamMember[];
  departments: Department[];
  settings: TeamSettings;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  lead: string;
  members: string[];
  description?: string;
}

export interface TeamSettings {
  visibility: 'public' | 'private';
  joinByInvite: boolean;
  defaultRole: 'member' | 'lead';
  allowPublicProjects: boolean;
}

export interface ActivityLog {
  id: string;
  teamId: string;
  userId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

class TeamService {
  private teams: Map<string, Team> = new Map();
  private activityLogs: ActivityLog[] = [];
  private storageKey = 'team_data';
  private activityKey = 'team_activity';

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const activity = localStorage.getItem(this.activityKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.teams = new Map(Object.entries(parsed));
      }
      if (activity) {
        this.activityLogs = JSON.parse(activity);
      }
    } catch (error) {
      console.error('Error loading team data from storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = Object.fromEntries(this.teams);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
      localStorage.setItem(this.activityKey, JSON.stringify(this.activityLogs));
    } catch (error) {
      console.error('Error saving team data to storage:', error);
    }
  }

  private logActivity(
    teamId: string,
    userId: string,
    action: string,
    targetType: string,
    targetId: string,
    metadata?: Record<string, any>
  ) {
    const log: ActivityLog = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      teamId,
      userId,
      action,
      targetType,
      targetId,
      metadata,
      timestamp: new Date().toISOString()
    };
    this.activityLogs.push(log);
    this.saveToStorage();
    return log;
  }

  createTeam(
    name: string,
    description: string,
    ownerId: string
  ): Team {
    const team: Team = {
      id: `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      owner: ownerId,
      members: [
        {
          id: ownerId,
          name: 'Owner',
          email: 'owner@team.local',
          role: 'owner',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${ownerId}`,
          joinedAt: new Date().toISOString()
        }
      ],
      departments: [],
      settings: {
        visibility: 'private',
        joinByInvite: true,
        defaultRole: 'member',
        allowPublicProjects: false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.teams.set(team.id, team);
    this.logActivity(team.id, ownerId, 'create', 'team', team.id);
    this.saveToStorage();
    return team;
  }

  getTeam(teamId: string): Team | null {
    return this.teams.get(teamId) || null;
  }

  getAllTeams(userId: string): Team[] {
    return Array.from(this.teams.values()).filter(
      team => team.members.some(m => m.id === userId)
    );
  }

  updateTeamSettings(teamId: string, userId: string, settings: Partial<TeamSettings>) {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');
    if (team.owner !== userId) throw new Error('Only owner can modify settings');

    team.settings = { ...team.settings, ...settings };
    team.updatedAt = new Date().toISOString();
    this.logActivity(teamId, userId, 'update', 'settings', teamId, { settings });
    this.saveToStorage();
    return team;
  }

  inviteMember(teamId: string, userId: string, email: string, role: TeamMember['role'] = 'member'): TeamMember {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');
    if (team.owner !== userId) throw new Error('Only owner can invite members');

    const member: TeamMember = {
      id: `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: email.split('@')[0],
      email,
      role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinedAt: new Date().toISOString()
    };

    team.members.push(member);
    team.updatedAt = new Date().toISOString();
    this.logActivity(teamId, userId, 'invite', 'member', member.id, { email, role });
    this.saveToStorage();
    return member;
  }

  removeMember(teamId: string, userId: string, memberId: string): void {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');
    if (team.owner !== userId) throw new Error('Only owner can remove members');

    team.members = team.members.filter(m => m.id !== memberId);
    team.updatedAt = new Date().toISOString();
    this.logActivity(teamId, userId, 'remove', 'member', memberId);
    this.saveToStorage();
  }

  updateMemberRole(
    teamId: string,
    userId: string,
    memberId: string,
    newRole: TeamMember['role']
  ): TeamMember {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');
    if (team.owner !== userId) throw new Error('Only owner can change roles');

    const member = team.members.find(m => m.id === memberId);
    if (!member) throw new Error('Member not found');

    member.role = newRole;
    team.updatedAt = new Date().toISOString();
    this.logActivity(teamId, userId, 'update_role', 'member', memberId, { newRole });
    this.saveToStorage();
    return member;
  }

  createDepartment(
    teamId: string,
    userId: string,
    name: string,
    leadId: string,
    description?: string
  ): Department {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');
    if (team.owner !== userId) throw new Error('Only owner can create departments');

    const department: Department = {
      id: `dept_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      lead: leadId,
      members: [leadId],
      description
    };

    team.departments.push(department);
    team.updatedAt = new Date().toISOString();
    this.logActivity(teamId, userId, 'create', 'department', department.id, { name });
    this.saveToStorage();
    return department;
  }

  addMemberToDepartment(teamId: string, userId: string, departmentId: string, memberId: string): void {
    const team = this.teams.get(teamId);
    if (!team) throw new Error('Team not found');

    const department = team.departments.find(d => d.id === departmentId);
    if (!department) throw new Error('Department not found');

    if (!department.members.includes(memberId)) {
      department.members.push(memberId);
      team.updatedAt = new Date().toISOString();
      this.logActivity(teamId, userId, 'add_to_department', 'member', memberId, { departmentId });
      this.saveToStorage();
    }
  }

  getActivityLog(teamId: string, limit: number = 50): ActivityLog[] {
    return this.activityLogs
      .filter(log => log.teamId === teamId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  updateMemberLastActive(teamId: string, memberId: string): void {
    const team = this.teams.get(teamId);
    if (!team) return;

    const member = team.members.find(m => m.id === memberId);
    if (member) {
      member.lastActive = new Date().toISOString();
      this.saveToStorage();
    }
  }
}

export const teamService = new TeamService();
