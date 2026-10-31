import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ProductProto } from '@org/shared';
import { AttributeValuesService } from './attribute-values.service';

@Controller()
export class AttributeValuesController {
  constructor(private readonly attributeValuesService: AttributeValuesService) {}

  @GrpcMethod('ProductService', 'CreateAttributeValue')
  async createAttributeValue(
    request: ProductProto.CreateAttributeValueRequest,
  ): Promise<ProductProto.AttributeValueResponse> {
    try {
      const value = await this.attributeValuesService.create(request.attributeId, request.value);
      return { success: true, message: 'Attribute value created successfully', value: this.toProto(value) };
    } catch (error) {
      this.rethrow(error, 'Could not create attribute value');
    }
  }

  @GrpcMethod('ProductService', 'UpdateAttributeValue')
  async updateAttributeValue(
    request: ProductProto.UpdateAttributeValueRequest,
  ): Promise<ProductProto.AttributeValueResponse> {
    try {
      const value = await this.attributeValuesService.update(request.id, request.value);
      return { success: true, message: 'Attribute value updated successfully', value: this.toProto(value) };
    } catch (error) {
      this.rethrow(error, 'Could not update attribute value');
    }
  }

  @GrpcMethod('ProductService', 'DeleteAttributeValue')
  async deleteAttributeValue(
    request: ProductProto.DeleteAttributeValueRequest,
  ): Promise<ProductProto.DeleteResponse> {
    try {
      await this.attributeValuesService.delete(request.id);
      return { success: true, message: 'Attribute value deleted successfully' };
    } catch (error) {
      this.rethrow(error, 'Could not delete attribute value');
    }
  }

  private toProto(value: { id: string; attribute_id: string; value: string }): ProductProto.AttributeValue {
    return { id: value.id, attributeId: value.attribute_id, value: value.value };
  }

  private rethrow(error: unknown, fallbackMessage: string): never {
    if (error instanceof RpcException) {
      throw error;
    }
    throw new RpcException({ code: status.INTERNAL, message: fallbackMessage });
  }
}
