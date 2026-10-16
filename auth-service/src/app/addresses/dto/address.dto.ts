export interface CreateAddressDto {
  user_id: string | number;
  label?: string;
  full_name: string;
  phone: string;
  address_line: string;
  area?: string | null;
  city: string;
  postal_code?: string | null;
  country?: string;
  is_default?: boolean;
}

export interface UpdateAddressDto {
  label?: string;
  full_name?: string;
  phone?: string;
  address_line?: string;
  area?: string | null;
  city?: string;
  postal_code?: string | null;
  country?: string;
  is_default?: boolean;
}
