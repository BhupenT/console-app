import { Injectable, HttpService } from '@nestjs/common';
import { FetchProducts } from './lib/FetchProducts';
import { Readable } from 'stream';
import { TransformData } from './lib/TransformDataStream';
import { WriteFileStream } from './lib/WriteFileStream';

@Injectable()
export class ExportProductService {
  private fetch: FetchProducts;
  private config: { [key: string]: any };
  constructor(private httpService: HttpService) {
    this.fetch = new FetchProducts(this.httpService);
  }

  setConfig(config: { [key: string]: any }) {
    this.config = config;
  }

  async exportProducts() {
    const readable = new Readable({ objectMode: true });

    // get the initial products
    const products: {
      [key: string]: any;
    }[] = await this.fetch.fetchProductsInfo(
      this.config.productCatalogUrl,
      'data._embedded.product',
    );

    // sort the products
    const sortedProducts = await this.sortProductsBy(
      products,
      this.config.file.sort.byField, // uses the config
      this.config.file.sort.sortOrder, // uses the config
    );

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
    return new TransformData({ objectMode: true }, async (data) => {
      let extraMetaUrl = this.config.extraMetaUrl;
      const parseVariables = /\{\{(.*?)\}\}/gi, // regex to get inside {{anythings}}. exec results 2nd array without "{{}}"
        extractVariables = parseVariables.exec(extraMetaUrl);

      // find all and replace with the actual value
      extraMetaUrl = extraMetaUrl.replace(
        `{{${extractVariables[1]}}}`,
        data[extractVariables[1]],
      );

      return data.video_count
        ? {
            data: {
              video_previews: await this.fetch.fetchProductsInfo(
                extraMetaUrl,
                'data._embedded.videos_url',
              ),
            },
          }
        : { data: { video_previews: [] } };
    });
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

  private sortProductsBy(
    products: Array<{ [key: string]: any }>,
    byField: string | number = 'video_count',
    sortType = 'DESC',
  ): Promise<any> {
    return new Promise((resolve) => {
      resolve(
        products.sort((a, b) => {
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
