import { Injectable, HttpService } from '@nestjs/common';
import { FetchProducts } from './lib/FetchProducts';
import { Readable } from 'stream';
import { TransformData } from './lib/TransformDataStream';
import { WriteFileStream } from './lib/WriteFileStream';

@Injectable()
export class ExportProductService {
  private fetch: FetchProducts;
  private transform: any;
  constructor(private httpService: HttpService) {
    this.fetch = new FetchProducts(this.httpService);
  }

  async exportProducts() {
    const readable = new Readable({ objectMode: true });

    // get the initial products
    const products: {
      [key: string]: any;
    }[] = await this.fetch.fetchProductsInfo(
      'https://eve.theiconic.com.au/catalog/products?gender=female&page=1&page_size=10&sort=popularity',
      'data._embedded.product',
    );

    // sort the products
    const sortedProducts = await this.sortDataBy(products);

    // push to the reable stream
    sortedProducts.forEach((product: { [key: string]: any }) => {
      readable.push(product);
    });

    readable.push(null); // push null to close the stream as its finished

    readable
      .pipe(this.createTransformStream()) // transform the product
      .pipe(this.createWriteStream(sortedProducts.length)); // finally drain write in the writable stream
  }

  createTransformStream() {
    return new TransformData({ objectMode: true }, async (data) =>
      data.video_count
        ? {
            data: {
              video_previews: await this.fetch.fetchProductsInfo(
                `https://eve.theiconic.com.au/catalog/products/${data.sku}/videos`,
                'data._embedded.videos_url',
              ),
            },
          }
        : { data: { video_previews: [] } },
    );
  }

  createWriteStream(itemCount: number) {
    return new WriteFileStream(
      'output.json',
      'json',
      { itemCount: itemCount },
      {
        objectMode: true,
      },
    );
  }

  private sortDataBy(
    data: Array<{ [key: string]: any }>,
    byField: string | number = 'video_count',
    sortType = 'DESC',
  ): Promise<any> {
    return new Promise((resolve) => {
      resolve(
        data.sort((a, b) => {
          if ('DESC' === sortType) {
            return a[byField] > b[byField] ? -1 : 1;
          } else {
            return a[byField] > b[byField] ? 1 : -1;
          }
        }),
      );
    });
  }
}
