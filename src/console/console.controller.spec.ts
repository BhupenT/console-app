import { HttpModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConsoleController } from './console.controller';
import { ExportProductService } from './export.products.service';

describe('ConsoleController', () => {
  let controller: ConsoleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConsoleController],
      providers: [ExportProductService],
      imports: [HttpModule],
    }).compile();

    controller = module.get<ConsoleController>(ConsoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
