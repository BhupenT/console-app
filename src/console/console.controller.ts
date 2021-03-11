import { Controller } from '@nestjs/common';
import { ExportProductService } from './export.products.service';
import { ConfigManager } from './lib/ConfigManager';
import * as consoleApp from './lib/types';

@Controller('console')
export class ConsoleController {
  private configManager: ConfigManager;
  constructor(private readonly ExportProductServices: ExportProductService) {
    this.configManager = new ConfigManager(`${process.cwd()}/iconic-cli.json`);
  }

  async initOptions(command: string) {
    const exportProductService = this.ExportProductServices;
    switch (command) {
      case 'export-products':
        console.log('generating products');
        // sets the config
        const settings: consoleApp.ExportProductsConfigSettings = await this.configManager.getConfig(
          exportProductService.constructor.name,
        );
        exportProductService.setConfig(settings);
        await exportProductService.exportProducts();
        break;

      default:
        console.log(
          `No such ${command} command found. See --help for more info`,
        );
        process.exit(1);
        break;
    }
  }
}
