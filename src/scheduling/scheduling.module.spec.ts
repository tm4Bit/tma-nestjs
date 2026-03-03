import { Test } from '@nestjs/testing';
import { SchedulerRegistry } from '@nestjs/schedule';
import { SchedulingModule } from './scheduling.module';

describe('SchedulingModule', () => {
  it('compiles and exposes SchedulerRegistry', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [SchedulingModule],
    }).compile();

    const registry = moduleRef.get(SchedulerRegistry, { strict: false });
    expect(registry).toBeDefined();

    await moduleRef.close();
  });
});
