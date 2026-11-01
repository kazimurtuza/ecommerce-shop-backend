import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ProductProto } from '@org/shared';
import { CategoriesService } from './categories.service';

@Controller()
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @GrpcMethod('ProductService', 'GetCategoryById')
  async getCategoryById(
    request: ProductProto.GetCategoryByIdRequest,
  ): Promise<ProductProto.CategoryResponse> {
    try {
      const category = await this.categoriesService.getById(request.id);
      return {
        success: true,
        message: 'Category retrieved successfully',
        category: {
          id: category.id,
          parentId: category.parent_id ?? undefined,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          status: this.toProtoStatus(category.status),
          sortOrder: category.sort_order,
          createdAt: category.created_at.toISOString(),
          updatedAt: category.updated_at.toISOString(),
          children: [],
        },
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ code: status.INTERNAL, message: 'Could not get category' });
    }
  }

  @GrpcMethod('ProductService', 'GetAllCategories')
  async getAllCategories(): Promise<ProductProto.CategoryListResponse> {
    try {
      const categories = await this.categoriesService.getMainCategories();
      return {
        success: true,
        categories: categories.map((category) => ({
          id: category.id,
          parentId: category.parent_id ?? undefined,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          status: this.toProtoStatus(category.status),
          sortOrder: category.sort_order,
          createdAt: category.created_at.toISOString(),
          updatedAt: category.updated_at.toISOString(),
          children: [],
        })),
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ code: status.INTERNAL, message: 'Could not get main categories' });
    }
  }

  @GrpcMethod('ProductService','GetChildCategories')
  async getChildCategories(
    request: ProductProto.GetChildCategoriesRequest,
  ): Promise<ProductProto.CategoryListResponse> {
    try {
      const categories = await this.categoriesService.getChildCategories(request.parentId);
      return {
        success: true,
        categories: categories.map((category) => ({
          id: category.id,
          parentId: category.parent_id ?? undefined,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          status: this.toProtoStatus(category.status),
          sortOrder: category.sort_order,
          createdAt: category.created_at.toISOString(),
          updatedAt: category.updated_at.toISOString(),
          children: [],
        })),
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ code: status.INTERNAL, message: 'Could not get child categories' });
    }
  }

  @GrpcMethod('ProductService', 'CreateCategory')
  async createCategory(
    request: ProductProto.CreateCategoryRequest,
  ): Promise<ProductProto.CategoryResponse> {
    try {
      const category = await this.categoriesService.create(request);
      return {
        success: true,
        message: 'Category created successfully',
        category: {
          id: category.id,
          parentId: category.parent_id ?? undefined,
          name: category.name,
          slug: category.slug,
          description: category.description,
          image: category.image,
          status: this.toProtoStatus(category.status),
          sortOrder: category.sort_order,
          createdAt: category.created_at.toISOString(),
          updatedAt: category.updated_at.toISOString(),
          children: [],
        },
      };
    } catch (error) {
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({ code: status.INTERNAL, message: 'Could not create category' });
    }
  }

  private toProtoStatus(value: number): ProductProto.ProductStatus {
    switch (value) {
      case 3:
        return ProductProto.ProductStatus.PRODUCT_STATUS_DRAFT;
      case 2:
        return ProductProto.ProductStatus.PRODUCT_STATUS_INACTIVE;
      default:
        return ProductProto.ProductStatus.PRODUCT_STATUS_ACTIVE;
    }
  }
}
