export interface CreateRoleDto {
  name: string;
  description?: string | null;
}

export interface AssignRoleDto {
  user_id: string | number;
  role_id: string | number;
}
