import { Controller } from '@nestjs/common';
import { MyConsoleService } from './console.service';

@Controller('console')
export class ConsoleController {
  constructor(private readonly myConsoleService: MyConsoleService) {}

  async initOptions(command: string) {
    const consoleService = this.myConsoleService;
    switch (command) {
      case 'export-products':
        console.log('generating products');
        await consoleService.exportProducts();
        break;

      default:
        console.log(`No such ${command} found. See --help for more info`);
        process.exit(1);
        break;
    }
  }
}
