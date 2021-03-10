import { Test, TestingModule } from '@nestjs/testing';
import { ExportProductService } from './export.products.service';

describe('ExportProductService', () => {
  let service: ExportProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportProductService],
    }).compile();

    service = module.get<ExportProductService>(ExportProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
