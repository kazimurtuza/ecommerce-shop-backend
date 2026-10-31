import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttributesService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    return this.prisma.attribute.findMany({
      include: { values: true },
      orderBy: { name: 'asc' },
    });
  }

  async create(input: { name: string; inputType?: string }) {
    const { name } = input;
    const normalizedName = name?.trim();
    const inputType = this.normalizeInputType(input.inputType);
    if (!normalizedName) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'name is required' });
    }

    try {
      return await this.prisma.attribute.create({
        data: {
          name: normalizedName,
          slug: this.toSlug(normalizedName),
          input_type: inputType,
        },
        include: { values: true },
      });
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002') {
        throw new RpcException({ code: status.ALREADY_EXISTS, message: 'Attribute name already exists' });
      }
      throw error;
    }
  }

  async update(id: string, updates: { name?: string; inputType?: string } = {}) {
    const { name, inputType } = updates;
    const normalizedId = id?.trim();
    if (!normalizedId) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'id is required' });
    }
    if (name !== undefined && !name.trim()) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'name must not be empty' });
    }
    const normalizedInputType = inputType === undefined ? undefined : this.normalizeInputType(inputType);

    const existing = await this.prisma.attribute.findUnique({ where: { id: normalizedId } });
    if (!existing) {
      throw new RpcException({ code: status.NOT_FOUND, message: `Attribute "${normalizedId}" not found` });
    }

    return this.prisma.attribute.update({
      where: { id: normalizedId },
      data: {
        ...(name === undefined ? {} : { name: name.trim(), slug: this.toSlug(name.trim()) }),
        ...(normalizedInputType === undefined ? {} : { input_type: normalizedInputType }),
      },
      include: { values: true },
    });
  }

  async delete(id: string) {
    const normalizedId = id?.trim();
    if (!normalizedId) {
      throw new RpcException({ code: status.INVALID_ARGUMENT, message: 'id is required' });
    }

    const existing = await this.prisma.attribute.findUnique({ where: { id: normalizedId }, select: { id: true } });
    if (!existing) {
      throw new RpcException({ code: status.NOT_FOUND, message: `Attribute "${normalizedId}" not found` });
    }

    await this.prisma.attribute.delete({ where: { id: normalizedId } });
  }

  private toSlug(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'attribute';
  }

  private normalizeInputType(inputType?: string): 'select' | 'color' | 'text' {
    const normalized = inputType?.trim().toLowerCase() || 'select';
    if (normalized !== 'select' && normalized !== 'color' && normalized !== 'text') {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'input_type must be one of: select, color, text',
      });
    }
    return normalized;
  }
}
