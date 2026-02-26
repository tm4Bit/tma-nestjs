import { Injectable } from '@nestjs/common';
import { AppRepository } from './app.repository.js';

@Injectable()
export class AppService {
  constructor(private readonly appRepository: AppRepository) {}

  async getHello(): Promise<string> {
    const dbVersion = await this.appRepository.getDatabaseVersion();
    return `Hello World! DB=${dbVersion}`;
  }
}
