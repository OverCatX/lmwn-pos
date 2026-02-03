import { Injectable } from '@nestjs/common';
import { HealthService } from './common/health/health.service';

@Injectable()
export class AppService {
  constructor(private readonly healthService: HealthService) { }

  getHello(): string {
    return 'Hello World!';
  }

  async checkDatabase() {
    return this.healthService.checkDatabase();
  }
}
