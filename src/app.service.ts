import { Injectable } from '@nestjs/common';
import { AppRepository } from './app.repository.js';

@Injectable()
export class AppService {
  constructor(private readonly appRepository: AppRepository) {}

  async checkhealth(): Promise<{ status: string; databaseVersion: string }> {
    const dbVersion = await this.appRepository.getDatabaseVersion();
    return {
      status: 'ok',
      databaseVersion: dbVersion,
    };
  }
}
