import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { ProductProto, toSlug } from '@org/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BrandService {
  constructor(private readonly prisma: PrismaService) {}

  async create(name: string) {
    const normalizedName = name.trim();
    const slug = toSlug(normalizedName, 'brand');
    return this.prisma.brand.create({
      data: { name: normalizedName, slug },
    });
  }

  async update(id:string,name:string){
    const normalizedName = name.trim();
    const slug = toSlug(normalizedName, 'brand');
    return this.prisma.brand.update({
      where: { id, deleted_at: null },
      data: { name: normalizedName, slug },
    });
  }

  async getAll(request: ProductProto.GetAllBrandsRequest) {
    const page = request.page || 1;
    const limit = request.limit || 20;
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'page must be positive and limit must be between 1 and 100' });
    }

    const where = {
      deleted_at: null,
      ...(request.status === ProductProto.ProductStatus.PRODUCT_STATUS_UNSPECIFIED
        ? {}
        : { status: this.toDatabaseStatus(request.status) }),
      ...(request.search?.trim()
        ? {
            OR: [
              { name: { contains: request.search.trim(), mode: 'insensitive' as const } },
              { slug: { contains: request.search.trim(), mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [brands, total] = await this.prisma.$transaction([
      this.prisma.brand.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.brand.count({ where }),
    ]);

    return { brands, total, page, limit };
  }

  async delete(id: string) {
    const normalizedId = id?.trim();
    if (!normalizedId) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'id is required' });
    }

    const result = await this.prisma.brand.updateMany({
      where: { id: normalizedId, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    if (result.count === 0) {
      throw new RpcException({ code: status.NOT_FOUND, message: `Brand "${normalizedId}" not found` });
    }
  }

  private toDatabaseStatus(value: ProductProto.ProductStatus): number {
    switch (value) {
      case ProductProto.ProductStatus.PRODUCT_STATUS_ACTIVE:
        return 1;
      case ProductProto.ProductStatus.PRODUCT_STATUS_INACTIVE:
        return 2;
      case ProductProto.ProductStatus.PRODUCT_STATUS_DRAFT:
        return 3;
      default:
        throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'Invalid brand status' });
    }
  }

}
