export interface IUserAddress {
  id: string | number;
  user_id: string | number;
  label: string;
  full_name: string;
  phone: string;
  address_line: string;
  area: string | null;
  city: string;
  postal_code: string | null;
  country: string;
  is_default: boolean;
  created_at: Date;
  updated_at: Date;
}

export class UserAddressModel implements IUserAddress {
  id!: string | number;
  user_id!: string | number;
  label: string = 'home';
  full_name!: string;
  phone!: string;
  address_line!: string;
  area: string | null = null;
  city!: string;
  postal_code: string | null = null;
  country: string = 'Bangladesh';
  is_default: boolean = false;
  created_at: Date = new Date();
  updated_at: Date = new Date();

  constructor(partial?: Partial<IUserAddress>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
