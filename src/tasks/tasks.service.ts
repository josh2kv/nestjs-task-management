import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  private logger = new Logger('TasksService', { timestamp: true });
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  async getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    const { status, search } = filterDto;

    const query = this.tasksRepository.createQueryBuilder('task');
    query.where({ user });

    if (status) query.andWhere('task.status = :status', { status });

    if (search)
      query.andWhere(
        '(LOWER(task.title) LIKE LOWER(:search) OR LOWER(task.description) LIKE LOWER(:search))',
        { search: `%${search}%` },
      );

    try {
      return query.getMany();
    } catch (error) {
      this.logger.error(
        `Failed to get tasks for user "${
          user.username
        }". Filters: ${JSON.stringify(filterDto)}`,
        error.stack,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: { id, user } });

    if (!found) throw new NotFoundException(`Task with ID "${id}" not found`);

    return found;
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task: Task = this.tasksRepository.create({
      ...createTaskDto,
      status: TaskStatus.OPEN,
      user,
    });

    return this.tasksRepository.save(task);
  }

  async deleteTask(id: string, user: User): Promise<Task> {
    const found = await this.getTaskById(id, user);

    return this.tasksRepository.remove(found);
  }

  async updateTask(id: string, status: TaskStatus, user: User): Promise<Task> {
    const found = await this.getTaskById(id, user);

    Object.assign(found, { status });

    return this.tasksRepository.save(found);
  }
}
