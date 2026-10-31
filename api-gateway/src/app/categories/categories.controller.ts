import { BadRequestException, Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { ProductProto } from '@org/shared';
import { CategoriesService } from './categories.service';
import type { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('create')
  create(@Body() dto: CreateCategoryDto): Promise<ProductProto.CategoryResponse> {
    if (!dto?.name?.trim() || !dto?.slug?.trim()) {
      throw new BadRequestException('name and slug are required');
    }
    if (dto.sort_order !== undefined && (!Number.isInteger(dto.sort_order) || dto.sort_order < 0)) {
      throw new BadRequestException('sort_order must be a non-negative integer');
    }
    if (dto.status && !['draft', 'active', 'inactive'].includes(dto.status)) {
      throw new BadRequestException('status must be draft, active, or inactive');
    }
    return this.categoriesService.create(dto);
  }
  // @Get('getCategory')
  // getCategory(@Query('id') id: string): Promise<ProductProto.CategoryResponse> {
  //   if (!id?.trim()) {
  //     throw new BadRequestException('id is required');
  //   }
  //   return this.categoriesService.getCategory(id.trim());
  // }


  @Get('maincategory')
  getMainCategories(): Promise<ProductProto.CategoryListResponse> {
    return this.categoriesService.getMainCategories();
  }
  @Get('childCategory')
  getChildCategory(@Query('parentId') parentId: string): Promise<ProductProto.CategoryListResponse> {
    if (!parentId?.trim()) {
      throw new BadRequestException('parentId is required');
    }
    return this.categoriesService.getChildCategories(parentId.trim());
  }
}
