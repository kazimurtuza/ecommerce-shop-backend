import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AddressesService } from './addresses.service';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @MessagePattern({ cmd: 'createAddress' })
  async createAddress(@Payload() @Body() dto: CreateAddressDto) {
    try {
      const address = await this.addressesService.createAddress(dto);
      return { success: true, data: address };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('user/:userId')
  @MessagePattern({ cmd: 'getUserAddresses' })
  async getUserAddresses(@Payload() @Param('userId') data: { userId: string | number } | string | number) {
    const userId = typeof data === 'object' && 'userId' in data ? data.userId : data;
    const addresses = await this.addressesService.findByUserId(userId);
    return { success: true, data: addresses };
  }

  @Patch(':id')
  @MessagePattern({ cmd: 'updateAddress' })
  async updateAddress(
    @Payload() payload: { id: string | number; dto: UpdateAddressDto },
    @Param('id') paramId?: string,
    @Body() bodyDto?: UpdateAddressDto,
  ) {
    const id = payload?.id || paramId;
    const dto = payload?.dto || bodyDto;
    if (!id || !dto) {
      return { success: false, message: 'Invalid payload' };
    }
    const updated = await this.addressesService.updateAddress(id, dto);
    return { success: true, data: updated };
  }

  @Patch(':id/default')
  @MessagePattern({ cmd: 'setDefaultAddress' })
  async setDefaultAddress(@Payload() @Param('id') data: { id: string | number } | string | number) {
    const id = typeof data === 'object' && 'id' in data ? data.id : data;
    const address = await this.addressesService.setDefaultAddress(id);
    return { success: true, data: address };
  }

  @Delete(':id')
  @MessagePattern({ cmd: 'deleteAddress' })
  async deleteAddress(@Payload() @Param('id') data: { id: string | number } | string | number) {
    const id = typeof data === 'object' && 'id' in data ? data.id : data;
    const deleted = await this.addressesService.deleteAddress(id);
    return { success: deleted };
  }
}
