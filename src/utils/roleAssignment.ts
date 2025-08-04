import { assignDefaultPassword } from '../config/credentials';

export interface UserRoleAssignment {
  userId: string;
  email: string;
  role: 'admin' | 'organizer' | 'member';
  password?: string;
  assignedAt: string;
  assignedBy: string;
}

// Function to assign role and auto-generate password
export const assignRoleToUser = (
  userId: string, 
  email: string, 
  role: 'admin' | 'organizer' | 'member',
  assignedBy: string
): UserRoleAssignment => {
  
  const defaultPassword = assignDefaultPassword(role);
  
  const assignment: UserRoleAssignment = {
    userId,
    email,
    role,
    password: defaultPassword,
    assignedAt: new Date().toISOString(),
    assignedBy
  };

  // In a real app, you'd save this to your database
  console.log(`Role assigned: ${role} to ${email} with password: ${defaultPassword}`);
  
  return assignment;
};

// Function to bulk assign roles
export const bulkAssignRoles = (
  assignments: Array<{userId: string, email: string, role: 'admin' | 'organizer' | 'member'}>,
  assignedBy: string
): UserRoleAssignment[] => {
  
  return assignments.map(assignment => 
    assignRoleToUser(assignment.userId, assignment.email, assignment.role, assignedBy)
  );
};
