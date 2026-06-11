import { useState, useEffect } from 'react';
import { teamService } from '../services/teamService';

export default function TeamDashboard({ onSelectTeam, onClose }) {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('member');
  const [currentUserId] = useState(() => {
    const user = localStorage.getItem('app_user');
    return user ? JSON.parse(user).id : `user_${Date.now()}`;
  });

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = () => {
    const allTeams = teamService.getAllTeams(currentUserId);
    setTeams(allTeams);
    if (allTeams.length > 0 && !selectedTeam) {
      setSelectedTeam(allTeams[0]);
    }
  };

  const handleCreateTeam = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const newTeam = teamService.createTeam(
      formData.name,
      formData.description,
      currentUserId
    );
    setTeams([...teams, newTeam]);
    setSelectedTeam(newTeam);
    setFormData({ name: '', description: '' });
    setShowCreateForm(false);
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    if (!selectedTeam || !memberEmail.trim()) return;

    teamService.inviteMember(selectedTeam.id, currentUserId, memberEmail, memberRole);
    const updatedTeam = teamService.getTeam(selectedTeam.id);
    setSelectedTeam(updatedTeam);
    setMemberEmail('');
    setMemberRole('member');
    setShowMemberForm(false);
  };

  const handleRemoveMember = (memberId) => {
    if (!selectedTeam) return;
    teamService.removeMember(selectedTeam.id, currentUserId, memberId);
    const updatedTeam = teamService.getTeam(selectedTeam.id);
    setSelectedTeam(updatedTeam);
  };

  const handleChangeMemberRole = (memberId, newRole) => {
    if (!selectedTeam) return;
    teamService.updateMemberRole(selectedTeam.id, currentUserId, memberId, newRole);
    const updatedTeam = teamService.getTeam(selectedTeam.id);
    setSelectedTeam(updatedTeam);
  };

  const handleCreateDepartment = (e) => {
    e.preventDefault();
    if (!selectedTeam) return;

    const deptName = prompt('Department name:');
    if (deptName && selectedTeam.members.length > 0) {
      const leadId = selectedTeam.members[0].id;
      teamService.createDepartment(selectedTeam.id, currentUserId, deptName, leadId);
      const updatedTeam = teamService.getTeam(selectedTeam.id);
      setSelectedTeam(updatedTeam);
    }
  };

  const activityLog = selectedTeam
    ? teamService.getActivityLog(selectedTeam.id, 10)
    : [];

  const isOwner = selectedTeam?.owner === currentUserId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Team Dashboard</h2>
          <button
            onClick={onClose}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* Teams List */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Teams</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                + Create Team
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateTeam} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="text"
                  placeholder="Team name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <textarea
                  placeholder="Team description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows="2"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedTeam?.id === team.id
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
                  }`}
                >
                  <h4 className="font-semibold text-gray-900 dark:text-white text-left">{team.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 text-left">
                    {team.members.length} members
                  </p>
                </button>
              ))}
            </div>
          </div>

          {selectedTeam && (
            <>
              {/* Team Details */}
              <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">{selectedTeam.name}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  {selectedTeam.description || 'No description'}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Members</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedTeam.members.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Departments</span>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {selectedTeam.departments.length}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                    <p className="font-semibold text-gray-900 dark:text-white text-xs">
                      {new Date(selectedTeam.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Role</span>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">
                      {isOwner ? 'Owner' : 'Member'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Members Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h5 className="font-semibold text-gray-900 dark:text-white">Members</h5>
                  {isOwner && (
                    <button
                      onClick={() => setShowMemberForm(!showMemberForm)}
                      className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      + Invite
                    </button>
                  )}
                </div>

                {showMemberForm && (
                  <form onSubmit={handleInviteMember} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <input
                      type="email"
                      placeholder="Member email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                    <select
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      className="w-full mb-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="member">Member</option>
                      <option value="lead">Lead</option>
                      <option value="admin">Admin</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        Invite
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowMemberForm(false)}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {selectedTeam.members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOwner && member.id !== selectedTeam.owner && (
                          <>
                            <select
                              value={member.role}
                              onChange={(e) => handleChangeMemberRole(member.id, e.target.value)}
                              className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                            >
                              <option value="member">Member</option>
                              <option value="lead">Lead</option>
                              <option value="admin">Admin</option>
                            </select>
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </>
                        )}
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded capitalize">
                          {member.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Log */}
              <div>
                <h5 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h5>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {activityLog.map((log) => (
                    <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      <p className="text-gray-900 dark:text-white capitalize">
                        {log.action} {log.targetType}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {activityLog.length === 0 && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm">No recent activity</p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
