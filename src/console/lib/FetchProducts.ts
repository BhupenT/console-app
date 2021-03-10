import { HttpService } from '@nestjs/common';

export class FetchProducts {
  constructor(private httpService: HttpService) {}

  async fetchProductsInfo(url: string, fields = 'all'): Promise<any> {
    const response = await this.httpService.get(url).toPromise();
    let productsInfo = response;
    fields.split('.').forEach((field) => {
      productsInfo = productsInfo[field];
    });
    return productsInfo;
  }
}
