import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@Body() dto: CreateCategoryDto) {
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
}
