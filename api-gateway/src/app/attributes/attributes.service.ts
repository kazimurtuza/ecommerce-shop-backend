import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ProductProto } from '@org/shared';

@Injectable()
export class AttributesService implements OnModuleInit {
  private productGrpcService!: ProductProto.ProductServiceClient;

  constructor(@Inject('PRODUCT_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.productGrpcService = this.client.getService<ProductProto.ProductServiceClient>('ProductService');
  }

  createAttribute(request: ProductProto.CreateAttributeRequest): Promise<ProductProto.AttributeResponse> {
    return firstValueFrom(this.productGrpcService.createAttribute(request));
  }

  getAllAttributes(): Promise<ProductProto.AttributeListResponse> {
    return firstValueFrom(this.productGrpcService.getAllAttributes({}));
  }

  updateAttribute(request: ProductProto.UpdateAttributeRequest): Promise<ProductProto.AttributeResponse> {
    return firstValueFrom(this.productGrpcService.updateAttribute(request));
  }

  deleteAttribute(request: ProductProto.DeleteAttributeRequest): Promise<ProductProto.DeleteResponse> {
    return firstValueFrom(this.productGrpcService.deleteAttribute(request));
  }

  createAttributeValue(
    request: ProductProto.CreateAttributeValueRequest,
  ): Promise<ProductProto.AttributeValueResponse> {
    return firstValueFrom(this.productGrpcService.createAttributeValue(request));
  }

  updateAttributeValue(
    request: ProductProto.UpdateAttributeValueRequest,
  ): Promise<ProductProto.AttributeValueResponse> {
    return firstValueFrom(this.productGrpcService.updateAttributeValue(request));
  }

  deleteAttributeValue(request: ProductProto.DeleteAttributeValueRequest): Promise<ProductProto.DeleteResponse> {
    return firstValueFrom(this.productGrpcService.deleteAttributeValue(request));
  }
}
