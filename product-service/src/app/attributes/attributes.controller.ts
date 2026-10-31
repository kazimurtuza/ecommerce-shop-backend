import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ProductProto } from '@org/shared';
import { AttributesService } from './attributes.service';

@Controller()
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @GrpcMethod('ProductService', 'CreateAttribute')
  async createAttribute(
    request: ProductProto.CreateAttributeRequest,
  ): Promise<ProductProto.AttributeResponse> {
    try {
      const attribute = await this.attributesService.create({
        name: request.name,
        inputType: request.inputType,
      });
      return { success: true, message: 'Attribute created successfully', attribute: this.toProto(attribute) };
    } catch (error) {
      this.rethrow(error, 'Could not create attribute');
    }
  }

  @GrpcMethod('ProductService', 'GetAllAttributes')
  async getAllAttributes(): Promise<ProductProto.AttributeListResponse> {
    try {
      const attributes = await this.attributesService.getAll();
      return { success: true, attributes: attributes.map((attribute) => this.toProto(attribute)) };
    } catch (error) {
      this.rethrow(error, 'Could not get attributes');
    }
  }

  @GrpcMethod('ProductService', 'UpdateAttribute')
  async updateAttribute(
    request: ProductProto.UpdateAttributeRequest,
  ): Promise<ProductProto.AttributeResponse> {
    try {
      const attribute = await this.attributesService.update(request.id, {
        name: request.name,
        inputType: request.inputType,
      });
      return { success: true, message: 'Attribute updated successfully', attribute: this.toProto(attribute) };
    } catch (error) {
      this.rethrow(error, 'Could not update attribute');
    }
  }

  @GrpcMethod('ProductService', 'DeleteAttribute')
  async deleteAttribute(
    request: ProductProto.DeleteAttributeRequest,
  ): Promise<ProductProto.DeleteResponse> {
    try {
      await this.attributesService.delete(request.id);
      return { success: true, message: 'Attribute deleted successfully' };
    } catch (error) {
      this.rethrow(error, 'Could not delete attribute');
    }
  }

  private toProto(attribute: {
    id: string;
    name: string;
    slug: string;
    input_type: string;
    values: { id: string; attribute_id: string; value: string }[];
  }): ProductProto.Attribute {
    return {
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      inputType: attribute.input_type,
      values: attribute.values.map((value) => ({
        id: value.id,
        attributeId: value.attribute_id,
        value: value.value,
      })),
    };
  }

  private rethrow(error: unknown, fallbackMessage: string): never {
    if (error instanceof RpcException) {
      throw error;
    }
    throw new RpcException({ code: status.INTERNAL, message: fallbackMessage });
  }
}
