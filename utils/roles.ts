import { Roles } from "@/types/globals";
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (roles: string | string[]) => {
  const { userId, sessionClaims } = await auth();
  
  if (!sessionClaims || !sessionClaims.metadata?.role) return false;
  
  // Asigură-te că rolul este tratat ca un string
  const userRole = String(sessionClaims.metadata.role).toLowerCase();
  
  // Transformă roles în array dacă este un string
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  // Verifică dacă rolul utilizatorului este în array-ul de roluri permise
  return rolesArray.some(role => String(role).toLowerCase() === userRole);
};

export const getRole = async () => {
  const { userId, sessionClaims } = await auth();

  if (!sessionClaims || !sessionClaims.metadata?.role) {
    return "patient"; // valoare implicită
  }

  return String(sessionClaims.metadata.role).toLowerCase();
};