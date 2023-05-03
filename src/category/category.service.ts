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

  findAll() {
    let builder: any = this.categoryRepository.createQueryBuilder();

    builder = builder.limit(2).skip(1).getMany();

    return builder;
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
