import { BadRequestException, Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import type { ProductProto } from '@org/shared';
import { AttributesService } from './attributes.service';

@Controller('attribute-values')
export class AttributeValuesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Post()
  create(
    @Body() body: { attributeId?: string; value?: string },
  ): Promise<ProductProto.AttributeValueResponse> {
    const attributeId = body?.attributeId?.trim();
    const value = body?.value?.trim();
    if (!attributeId || !value) {
      throw new BadRequestException('attributeId and value are required');
    }

    return this.attributesService.createAttributeValue({ attributeId, value });
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: { value?: string },
  ): Promise<ProductProto.AttributeValueResponse> {
    const value = body?.value?.trim();
    if (!value) {
      throw new BadRequestException('value is required');
    }

    return this.attributesService.updateAttributeValue({ id, value });
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<ProductProto.DeleteResponse> {
    return this.attributesService.deleteAttributeValue({ id });
  }
}
