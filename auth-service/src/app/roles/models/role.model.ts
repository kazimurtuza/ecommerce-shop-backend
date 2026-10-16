export interface IRole {
  id: string | number;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export class RoleModel implements IRole {
  id!: string | number;
  name!: string;
  description: string | null = null;
  created_at: Date = new Date();
  updated_at: Date = new Date();

  constructor(partial?: Partial<IRole>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
