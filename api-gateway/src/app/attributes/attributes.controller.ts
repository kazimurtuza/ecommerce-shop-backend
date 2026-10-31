import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import type { ProductProto } from '@org/shared';
import { AttributesService } from './attributes.service';

type AttributeInputType = 'select' | 'color' | 'text';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  create(@Body() body: { name?: string; inputType?: string }): Promise<ProductProto.AttributeResponse> {
    const name = body?.name?.trim();
    if (!name) {
      throw new BadRequestException('name is required');
    }

    return this.attributesService.createAttribute({
      name,
      inputType: this.validateInputType(body.inputType) ?? 'select',
    });
  }

  @Get()
  getAll(): Promise<ProductProto.AttributeListResponse> {
    return this.attributesService.getAllAttributes();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { name?: string; inputType?: string },
  ): Promise<ProductProto.AttributeResponse> {
    const name = body?.name?.trim();
    if (body?.name !== undefined && !name) {
      throw new BadRequestException('name must not be empty');
    }
    if (name === undefined && body?.inputType === undefined) {
      throw new BadRequestException('name or inputType is required');
    }

    return this.attributesService.updateAttribute({
      id,
      name,
      inputType: body?.inputType === undefined ? undefined : this.validateInputType(body.inputType),
    });
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<ProductProto.DeleteResponse> {
    return this.attributesService.deleteAttribute({ id });
  }

  private validateInputType(value?: string): AttributeInputType | undefined {
    if (value === undefined || value === '') {
      return undefined;
    }
    if (value !== 'select' && value !== 'color' && value !== 'text') {
      throw new BadRequestException('inputType must be select, color, or text');
    }
    return value;
  }
}
