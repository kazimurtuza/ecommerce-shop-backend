import { Controller } from '@nestjs/common';
import { status } from '@grpc/grpc-js';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { ProductProto } from '@org/shared';
import { BrandService } from './brands.service';

@Controller()
export class BrandsController {
  constructor(private readonly brandsService: BrandService) {}

  @GrpcMethod('ProductService', 'DeleteBrand')
  async deleteBrand(request: ProductProto.DeleteBrandRequest): Promise<ProductProto.DeleteResponse> {
    try {
      await this.brandsService.delete(request.id);
      return { success: true, message: 'Brand deleted successfully' };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ code: status.INTERNAL, message: 'Could not delete brand' });
    }
  }
  @GrpcMethod('ProductService', 'CreateBrand')
  async createBrand(request: ProductProto.CreateBrandRequest): Promise<ProductProto.BrandResponse> {
    try {
      const brand = await this.brandsService.create(request.name);
      return {
        success: true,
        message: 'Brand created successfully',
        brand: {
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logo: brand.image,
          description: brand.description,
          status: ProductProto.ProductStatus.PRODUCT_STATUS_ACTIVE,
          createdAt: brand.created_at.toISOString(),
          updatedAt: brand.updated_at.toISOString(),
        },
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ code: status.INTERNAL, message: 'Could not create brand' });
    }
  }

  @GrpcMethod('ProductService', 'GetAllBrands')
  async getAllBrands(request: ProductProto.GetAllBrandsRequest): Promise<ProductProto.BrandListResponse> {
    try {
      const result = await this.brandsService.getAll(request);
      return {
        success: true,
        brands: result.brands.map((brand) => ({
          id: brand.id,
          name: brand.name,
          slug: brand.slug,
          logo: brand.image,
          description: brand.description,
          status: this.toProtoStatus(brand.status),
          createdAt: brand.created_at.toISOString(),
          updatedAt: brand.updated_at.toISOString(),
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ code: status.INTERNAL, message: 'Could not get brands' });
    }
  }

  private toProtoStatus(value: number): ProductProto.ProductStatus {
    switch (value) {
      case 2:
        return ProductProto.ProductStatus.PRODUCT_STATUS_INACTIVE;
      case 3:
        return ProductProto.ProductStatus.PRODUCT_STATUS_DRAFT;
      default:
        return ProductProto.ProductStatus.PRODUCT_STATUS_ACTIVE;
    }
  }
}
