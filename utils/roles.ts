import { Roles } from "@/types/globals";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (roles: string | string[]) => {
  const { userId, sessionClaims } = await auth();
  
  if (!sessionClaims || !sessionClaims.metadata?.role) return false;
  
  // Make sure the role is treated as a string
  const userRole = String(sessionClaims.metadata.role).toLowerCase();
  
  // Transform roles into an array if it's a string
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  // Check if the user's role is in the array of permitted roles
  return rolesArray.some(role => String(role).toLowerCase() === userRole);
};

export const getRole = async () => {
  const { userId, sessionClaims } = await auth();

  if (!sessionClaims || !sessionClaims.metadata?.role) {
    return "patient"; // default value
  }

  return String(sessionClaims.metadata.role).toLowerCase();
};