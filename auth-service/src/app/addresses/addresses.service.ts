import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async createAddress(dto: CreateAddressDto) {
    const userId = Number(dto.user_id);

    if (dto.is_default) {
      await this.resetDefault(userId);
    }

    return this.prisma.userAddress.create({
      data: {
        user_id: userId,
        label: dto.label || 'home',
        full_name: dto.full_name,
        phone: dto.phone,
        address_line: dto.address_line,
        area: dto.area || null,
        city: dto.city,
        postal_code: dto.postal_code || null,
        country: dto.country || 'Bangladesh',
        is_default: dto.is_default ?? false,
      },
    });
  }

  async findById(addressId: string | number) {
    return this.prisma.userAddress.findUnique({
      where: { id: Number(addressId) },
    });
  }

  async findByUserId(userId: string | number) {
    return this.prisma.userAddress.findMany({
      where: { user_id: Number(userId) },
    });
  }

  async updateAddress(addressId: string | number, dto: UpdateAddressDto) {
    const id = Number(addressId);
    const address = await this.findById(id);
    if (!address) {
      throw new NotFoundException(`Address with ID "${addressId}" not found`);
    }

    if (dto.is_default) {
      await this.resetDefault(address.user_id);
    }

    return this.prisma.userAddress.update({
      where: { id },
      data: {
        label: dto.label,
        full_name: dto.full_name,
        phone: dto.phone,
        address_line: dto.address_line,
        area: dto.area,
        city: dto.city,
        postal_code: dto.postal_code,
        country: dto.country,
        is_default: dto.is_default,
      },
    });
  }

  async setDefaultAddress(addressId: string | number) {
    const id = Number(addressId);
    const address = await this.findById(id);
    if (!address) {
      throw new NotFoundException(`Address with ID "${addressId}" not found`);
    }

    await this.resetDefault(address.user_id);

    return this.prisma.userAddress.update({
      where: { id },
      data: { is_default: true },
    });
  }

  async deleteAddress(addressId: string | number): Promise<boolean> {
    try {
      await this.prisma.userAddress.delete({
        where: { id: Number(addressId) },
      });
      return true;
    } catch {
      return false;
    }
  }

  private async resetDefault(userId: number): Promise<void> {
    await this.prisma.userAddress.updateMany({
      where: { user_id: userId, is_default: true },
      data: { is_default: false },
    });
  }
}
