import { assignDefaultPassword, SECURE_CREDENTIALS, UserCredentials } from '../config/credentials';

export interface UserRoleAssignment {
  userId: string;
  email: string;
  role: 'admin' | 'organizer' | 'member';
  assignedAt: string;
  assignedBy: string;
  isActive: boolean;
  permissions: string[];
  displayName: string;
  lastUpdated: string;
  // Removed password field - passwords should not be stored in assignments
}

// In-memory storage for demo (in production, use a secure database)
const roleAssignments = new Map<string, UserRoleAssignment>();

// Validation helpers
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidRole = (role: string): role is 'admin' | 'organizer' | 'member' => {
  return ['admin', 'organizer', 'member'].includes(role);
};

// Function to assign role to user
export const assignRoleToUser = (
  userId: string, 
  email: string, 
  role: 'admin' | 'organizer' | 'member',
  assignedBy: string,
  displayName?: string
): UserRoleAssignment | null => {
  
  // Input validation
  if (!userId || !email || !role || !assignedBy) {
    console.error('Missing required parameters for role assignment');
    return null;
  }

  if (!isValidEmail(email)) {
    console.error('Invalid email format');
    return null;
  }

  if (!isValidRole(role)) {
    console.error('Invalid role specified');
    return null;
  }

  const roleTemplate = SECURE_CREDENTIALS[role];
  if (!roleTemplate) {
    console.error(`Role template not found for: ${role}`);
    return null;
  }
  
  const assignment: UserRoleAssignment = {
    userId,
    email,
    role,
    assignedAt: new Date().toISOString(),
    assignedBy,
    isActive: true,
    permissions: [...roleTemplate.permissions], // Create a copy
    displayName: displayName || generateDisplayName(role),
    lastUpdated: new Date().toISOString()
  };

  // Save the assignment securely
  try {
    saveRoleAssignment(assignment);
    
    // Log assignment without sensitive data
    console.log(`Role assigned: ${role} to user ${userId} (${email})`);
    console.log(`Permissions granted:`, assignment.permissions);
    
    // Notify user about their new role (in production, send email)
    notifyUserOfRoleAssignment(assignment);
    
    return assignment;
  } catch (error) {
    console.error('Failed to save role assignment:', error);
    return null;
  }
};

// Function to bulk assign roles with better error handling
export const bulkAssignRoles = (
  assignments: Array<{
    userId: string, 
    email: string, 
    role: 'admin' | 'organizer' | 'member', 
    displayName?: string
  }>,
  assignedBy: string
): { successful: UserRoleAssignment[], failed: Array<{assignment: any, error: string}> } => {
  
  const successful: UserRoleAssignment[] = [];
  const failed: Array<{assignment: any, error: string}> = [];
  
  for (const assignment of assignments) {
    try {
      const result = assignRoleToUser(
        assignment.userId, 
        assignment.email, 
        assignment.role, 
        assignedBy, 
        assignment.displayName
      );
      
      if (result) {
        successful.push(result);
      } else {
        failed.push({
          assignment,
          error: 'Role assignment failed - check logs for details'
        });
      }
    } catch (error) {
      failed.push({
        assignment,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  
  console.log(`Bulk assignment completed: ${successful.length} successful, ${failed.length} failed`);
  return { successful, failed };
};

// Function to update role assignment
export const updateRoleAssignment = (
  userId: string,
  newRole: 'admin' | 'organizer' | 'member',
  updatedBy: string
): UserRoleAssignment | null => {
  
  if (!userId || !newRole || !updatedBy) {
    console.error('Missing required parameters for role update');
    return null;
  }

  if (!isValidRole(newRole)) {
    console.error('Invalid role specified');
    return null;
  }
  
  const existingAssignment = getRoleAssignment(userId);
  if (!existingAssignment) {
    console.log(`No existing assignment found for user ${userId}`);
    return null;
  }
  
  // Don't update if role is the same
  if (existingAssignment.role === newRole) {
    console.log(`User ${userId} already has role ${newRole}`);
    return existingAssignment;
  }

  const oldRole = existingAssignment.role;
  const roleTemplate = SECURE_CREDENTIALS[newRole];
  
  if (!roleTemplate) {
    console.error(`Role template not found for: ${newRole}`);
    return null;
  }

  // Update the assignment
  existingAssignment.role = newRole;
  existingAssignment.permissions = [...roleTemplate.permissions];
  existingAssignment.lastUpdated = new Date().toISOString();
  
  try {
    saveRoleAssignment(existingAssignment);
    console.log(`Role updated for ${userId}: ${oldRole} -> ${newRole}`);
    
    // Notify user of role change
    notifyUserOfRoleChange(existingAssignment, oldRole);
    
    return existingAssignment;
  } catch (error) {
    console.error('Failed to update role assignment:', error);
    return null;
  }
};

// Function to deactivate role assignment
export const deactivateRoleAssignment = (userId: string, deactivatedBy: string): boolean => {
  if (!userId || !deactivatedBy) {
    console.error('Missing required parameters for deactivation');
    return false;
  }

  const assignment = getRoleAssignment(userId);
  if (!assignment) {
    console.log(`No assignment found for user ${userId}`);
    return false;
  }
  
  if (!assignment.isActive) {
    console.log(`Assignment for user ${userId} is already inactive`);
    return true;
  }

  try {
    assignment.isActive = false;
    assignment.lastUpdated = new Date().toISOString();
    saveRoleAssignment(assignment);
    
    console.log(`Role assignment deactivated for user ${userId} by ${deactivatedBy}`);
    
    // Notify user of deactivation
    notifyUserOfDeactivation(assignment);
    
    return true;
  } catch (error) {
    console.error('Failed to deactivate role assignment:', error);
    return false;
  }
};

// Function to reactivate role assignment
export const reactivateRoleAssignment = (userId: string, reactivatedBy: string): boolean => {
  if (!userId || !reactivatedBy) {
    console.error('Missing required parameters for reactivation');
    return false;
  }

  const assignment = getRoleAssignment(userId);
  if (!assignment) {
    console.log(`No assignment found for user ${userId}`);
    return false;
  }
  
  if (assignment.isActive) {
    console.log(`Assignment for user ${userId} is already active`);
    return true;
  }

  try {
    assignment.isActive = true;
    assignment.lastUpdated = new Date().toISOString();
    saveRoleAssignment(assignment);
    
    console.log(`Role assignment reactivated for user ${userId} by ${reactivatedBy}`);
    return true;
  } catch (error) {
    console.error('Failed to reactivate role assignment:', error);
    return false;
  }
};

// Function to get role assignment by user ID
export const getRoleAssignment = (userId: string): UserRoleAssignment | null => {
  if (!userId) {
    console.error('User ID is required');
    return null;
  }

  return roleAssignments.get(userId) || null;
};

// Function to save role assignment (secure in-memory storage for demo)
const saveRoleAssignment = (assignment: UserRoleAssignment): void => {
  if (!assignment.userId) {
    throw new Error('Cannot save assignment without userId');
  }
  
  // In production, this would save to a secure database
  roleAssignments.set(assignment.userId, { ...assignment });
};

// Function to get all role assignments with filtering
export const getAllRoleAssignments = (activeOnly: boolean = true): UserRoleAssignment[] => {
  const allAssignments = Array.from(roleAssignments.values());
  
  if (activeOnly) {
    return allAssignments.filter(assignment => assignment.isActive);
  }
  
  return allAssignments;
};

// Function to get assignments by role
export const getAssignmentsByRole = (role: 'admin' | 'organizer' | 'member'): UserRoleAssignment[] => {
  return getAllRoleAssignments().filter(assignment => assignment.role === role);
};

// Function to validate role assignment
export const validateRoleAssignment = (assignment: UserRoleAssignment): boolean => {
  if (!assignment) return false;
  
  return !!(
    assignment.userId &&
    assignment.email &&
    isValidEmail(assignment.email) &&
    isValidRole(assignment.role) &&
    assignment.assignedBy &&
    assignment.assignedAt &&
    assignment.permissions &&
    Array.isArray(assignment.permissions)
  );
};

// Helper function to generate display name
const generateDisplayName = (role: string): string => {
  const roleNames = {
    admin: 'System Administrator',
    organizer: 'Event Organizer',
    member: 'Community Member'
  };
  
  return roleNames[role as keyof typeof roleNames] || `${role.charAt(0).toUpperCase() + role.slice(1)} User`;
};

// Notification functions (in production, these would send emails/notifications)
const notifyUserOfRoleAssignment = (assignment: UserRoleAssignment): void => {
  console.log(`📧 Notification: ${assignment.email} has been assigned the role of ${assignment.role}`);
  // In production: send email with role details and default password
};

const notifyUserOfRoleChange = (assignment: UserRoleAssignment, oldRole: string): void => {
  console.log(`📧 Notification: ${assignment.email} role changed from ${oldRole} to ${assignment.role}`);
  // In production: send email about role change
};

const notifyUserOfDeactivation = (assignment: UserRoleAssignment): void => {
  console.log(`📧 Notification: ${assignment.email} role has been deactivated`);
  // In production: send email about account deactivation
};

// Function to get user statistics
export const getRoleStatistics = (): { role: string, count: number, activeCount: number }[] => {
  const allAssignments = Array.from(roleAssignments.values());
  const stats = new Map<string, { total: number, active: number }>();
  
  // Initialize stats for all roles
  ['admin', 'organizer', 'member'].forEach(role => {
    stats.set(role, { total: 0, active: 0 });
  });
  
  // Count assignments
  allAssignments.forEach(assignment => {
    const roleStat = stats.get(assignment.role) || { total: 0, active: 0 };
    roleStat.total++;
    if (assignment.isActive) {
      roleStat.active++;
    }
    stats.set(assignment.role, roleStat);
  });
  
  return Array.from(stats.entries()).map(([role, counts]) => ({
    role,
    count: counts.total,
    activeCount: counts.active
  }));
};
