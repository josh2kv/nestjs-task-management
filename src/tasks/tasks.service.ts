import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './task-status.enum';
import { Task } from './task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepository: Repository<Task>,
  ) {}

  getAllTasks(): Promise<Task[]> {
    return this.tasksRepository.find();
  }

  async getTaskById(id: string): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: { id } });

    if (!found) throw new NotFoundException(`Task with ID "${id}" not found`);

    return found;
  }

  createTask(createTaskDto: CreateTaskDto): Promise<Task> {
    const task: Task = this.tasksRepository.create({
      ...createTaskDto,
      status: TaskStatus.OPEN,
    });

    return this.tasksRepository.save(task);
  }

  async deleteTask(id: string): Promise<Task> {
    const found = await this.getTaskById(id);

    return this.tasksRepository.remove(found);
  }

  async updateTask(id: string, status: TaskStatus): Promise<Task> {
    const found = await this.getTaskById(id);

    Object.assign(found, { status });

    return this.tasksRepository.save(found);
  }

  getTasksWithFilters(filterDto: GetTasksFilterDto): Promise<Task[]> {
    const { status, search } = filterDto;

    return this.tasksRepository.find({
      where: [
        { status },
        { title: ILike(`%${search}%`) },
        {
          description: ILike(`%${search}%`),
          // where: [{ status }, { title: search }, { description: search }],
        },
      ],
    });
  }
}
