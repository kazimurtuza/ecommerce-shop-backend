import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ProductProto } from '@org/shared';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService implements OnModuleInit {
  private productGrpcService!: ProductProto.ProductServiceClient;

  constructor(@Inject('PRODUCT_SERVICE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.productGrpcService = this.client.getService<ProductProto.ProductServiceClient>('ProductService');
  }

  create(dto: CreateCategoryDto) {
    const request: ProductProto.CreateCategoryRequest = {
      parentId: dto.parent_id ?? '',
      name: dto.name.trim(),
      slug: dto.slug.trim(),
      description: dto.description ?? '',
      image: dto.image ?? '',
      status: this.toProtoStatus(dto.status),
      sortOrder: dto.sort_order ?? 0,
    };
    return firstValueFrom(this.productGrpcService.createCategory(request));
  }

  private toProtoStatus(value: CreateCategoryDto['status']): ProductProto.ProductStatus {
    switch (value) {
      case 'draft':
        return ProductProto.ProductStatus.PRODUCT_STATUS_DRAFT;
      case 'inactive':
        return ProductProto.ProductStatus.PRODUCT_STATUS_INACTIVE;
      default:
        return ProductProto.ProductStatus.PRODUCT_STATUS_ACTIVE;
    }
  }
}
