import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    private userService: UserService,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<Object | undefined> {
    try {
      const user = await this.userService.isModelExists(
        +createCategoryDto.user,
      );

      const created = await this.categoryRepository.save({
        ...createCategoryDto,
        user,
      });

      this.logger.log(`created a new category by id#${created?.id}`);

      return created;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(error);
    }
  }

  async findAll(queryCategoryDto: QueryCategoryDto): Promise<Category[] | []> {
    const { page, limit, sortBy, sortType, ...query } = queryCategoryDto;

    try {
      let builder: any = this.categoryRepository
        .createQueryBuilder()
        .innerJoinAndSelect('Category.user', 'user');

      if (sortBy && sortType) builder = builder.orderBy(sortBy, sortType);

      if (page && limit)
        builder = builder.offset((page - 1) * limit).limit(limit);

      if (query.name)
        builder = builder.andWhere('category.name LIKE :name', {
          name: `%${query.name}%`,
        });

      if (query.categoryId)
        builder = builder.andWhere('category.id = :id', {
          id: query.categoryId,
        });

      if (query.userId)
        builder = builder.andWhere('user.id = :userid', {
          userid: query.userId,
        });

      return builder.getMany();
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(error);
    }
  }

  findById(id: number) {
    return this.categoryRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<Category | undefined> {
    try {
      await Promise.all([
        this.isModelExists(id),
        this.userService.isModelExists(updateCategoryDto.user),
      ]);

      await this.categoryRepository
        .createQueryBuilder()
        .update('category')
        .set(updateCategoryDto)
        .where('id = :id', { id })
        .execute();

      this.logger.log(`update a category by id#${id}`);

      return this.findById(id);
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(error);
    }
  }

  async remove(id: number) {
    try {
      await this.isModelExists(id);

      const removed = await this.categoryRepository.delete(id);

      this.logger.log(`removed a caterory by id#${id}`);

      return removed;
    } catch (error) {
      this.logger.error(error.message, error.stack);
      throw new BadRequestException(error);
    }
  }

  async isModelExists(id: number, opition = false, mess = '') {
    if (!id && opition) return;
    const message = mess || `user not found by id#${id}`;
    const user = await this.findById(id);
    if (!user) throw new HttpException(message, HttpStatus.NOT_FOUND);
    return user;
  }
}
