import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttributeValuesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(attributeId: string, value: string) {
    const normalizedAttributeId = attributeId?.trim();
    const normalizedValue = value?.trim();
    if (!normalizedAttributeId || !normalizedValue) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'attribute_id and value are required' });
    }

    const attribute = await this.prisma.attribute.findUnique({
      where: { id: normalizedAttributeId, deleted_at: null },
      select: { id: true },
    });
    if (!attribute) {
      throw new RpcException({ code: status.NOT_FOUND, message: `Attribute "${normalizedAttributeId}" not found` });
    }

    return this.prisma.attributeValue.create({
      data: { attribute_id: normalizedAttributeId, value: normalizedValue },
    });
  }

  async update(id: string, value?: string) {
    const normalizedId = id?.trim();
    if (!normalizedId) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'id is required' });
    }
    if (value !== undefined && !value.trim()) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'value must not be empty' });
    }

    const existing = await this.prisma.attributeValue.findFirst({ where: { id: normalizedId, deleted_at: null } });
    if (!existing) {
      throw new RpcException({ code: status.NOT_FOUND, message: `Attribute value "${normalizedId}" not found` });
    }

    return this.prisma.attributeValue.update({
      where: { id: normalizedId, deleted_at: null },
      data: value === undefined ? {} : { value: value.trim() },
    });
  }

  async delete(id: string) {
    const normalizedId = id?.trim();
    if (!normalizedId) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'id is required' });
    }

    const existing = await this.prisma.attributeValue.findFirst({
      where: { id: normalizedId, deleted_at: null },
      select: { id: true },
    });
    if (!existing) {
      throw new RpcException({ code: status.NOT_FOUND, message: `Attribute value "${normalizedId}" not found` });
    }

    await this.prisma.attributeValue.update({
      where: { id: normalizedId, deleted_at: null },
      data: { deleted_at: new Date() },
    });
  }
}
