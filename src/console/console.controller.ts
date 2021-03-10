import { Controller } from '@nestjs/common';
import { ExportProductService } from './export.products.service';

@Controller('console')
export class ConsoleController {
  constructor(private readonly ExportProductServices: ExportProductService) {}

  async initOptions(command: string) {
    const exportProductService = this.ExportProductServices;
    switch (command) {
      case 'export-products':
        console.log('generating products');
        await exportProductService.exportProducts();
        break;

      default:
        console.log(`No such ${command} found. See --help for more info`);
        process.exit(1);
        break;
    }
  }
}
