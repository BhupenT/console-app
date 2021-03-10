import { Test, TestingModule } from '@nestjs/testing';
import { MyConsoleService } from './console.service';

describe('MyConsoleService', () => {
  let service: MyConsoleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MyConsoleService],
    }).compile();

    service = module.get<MyConsoleService>(MyConsoleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
