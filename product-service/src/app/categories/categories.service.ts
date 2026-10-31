import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { PrismaService } from '../prisma/prisma.service';
import { ProductProto } from '@org/shared';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getById(id: string) {
    if (!id?.trim()) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'id is required' });
    }

    const category = await this.prisma.category.findUnique({ where: { id: id.trim() } });
    if (!category) {
      throw new RpcException({ code: status.NOT_FOUND, message: `Category "${id}" not found` });
    }
    return category;
  }

  async getMainCategories() {
    return this.prisma.category.findMany({
      where: { parent_id: null },
      orderBy: { sort_order: 'asc' },
    });
  }

  async getChildCategories(parentId: string) {
    if (!parentId?.trim()) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'parent_id is required' });
    }

    const parent = await this.prisma.category.findUnique({
      where: { id: parentId.trim() },
      select: { id: true },
    });
    if (!parent) {
      throw new RpcException({ code: status.NOT_FOUND, message: `Parent category "${parentId}" not found` });
    }

    return this.prisma.category.findMany({
      where: { parent_id: parentId.trim() },
      orderBy: { sort_order: 'asc' },
    });
  }

  async create(dto: ProductProto.CreateCategoryRequest) {
    if (!dto.name?.trim() || !dto.slug?.trim()) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'name and slug are required' });
    }
    if (!Number.isInteger(dto.sortOrder) || dto.sortOrder < 0) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'sort_order must be a non-negative integer' });
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
        select: { id: true },
      });
      if (!parent) {
        throw new RpcException({ code: status.NOT_FOUND, message: `Parent category "${dto.parentId}" not found` });
      }
    }

    try {
      return await this.prisma.category.create({
        data: {
          parent_id: dto.parentId || null,
          name: dto.name.trim(),
          slug: dto.slug.trim(),
          description: dto.description,
          image: dto.image,
          status: this.toDatabaseStatus(dto.status),
          sort_order: dto.sortOrder,
        },
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        throw new RpcException({ code: status.ALREADY_EXISTS, message: 'Category slug already exists' });
      }
      throw error;
    }
  }

  private toDatabaseStatus(value: ProductProto.ProductStatus): string {
    switch (value) {
      case ProductProto.ProductStatus.PRODUCT_STATUS_DRAFT:
        return 'draft';
      case ProductProto.ProductStatus.PRODUCT_STATUS_INACTIVE:
        return 'inactive';
      default:
        return 'active';
    }
  }
}
