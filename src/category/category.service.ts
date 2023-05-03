import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  create(createCategoryDto: CreateCategoryDto) {
    try {
      return this.categoryRepository
        .createQueryBuilder()
        .insert()
        .into('category')
        .values(createCategoryDto)
        .execute();
    } catch (error) {}
  }

  findAll() {
    return this.categoryRepository.find({
      where: { user: { id: 4 } },
      relations: ['user'],
    });
  }

  findById(id: number) {
    return `This action returns a #${id} category`;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  async remove(id: number) {
    // await this.isModelExists(id);

    const removed = await this.categoryRepository.delete(id);

    return removed;
  }

  async isModelExists(id: number, opition = false, mess = '') {
    if (!id && opition) return;
    const message = mess || `user not found by id#${id}`;
    const user = await this.findById(id);
    if (!user) throw new HttpException(message, HttpStatus.NOT_FOUND);
    return user;
  }
}
