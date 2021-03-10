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

  async exportProducts() {
    const readableStream = new Readable({ objectMode: true });
    interface Products {
      [key: string]: any;
    }
    let sortedProducts: Array<Products>;
    try {
      // get the initial products
      const products: Array<Products> = await this.fetch.fetchProductsInfo(
        this.config.productCatalogUrl,
        this.config.targetFields.products,
      );

      if (!products || !products.length) {
        this.showErrorMessage('No products to export', true);
      }
      // sort the products
      sortedProducts = await this.sortProductsBy(
        products,
        this.config.file.sort.byField, // uses the config
        this.config.file.sort.sortOrder, // uses the config
      );
    } catch (error) {
      console.log(error);
    }

    if (!sortedProducts || !sortedProducts.length) {
      this.showErrorMessage('No products to export', true);
    }

    // push to the reable stream
    sortedProducts.forEach((product: { [key: string]: any }) => {
      readableStream.push(product);
    });

    readableStream.push(null); // push null to close the stream as its finished

    readableStream
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

      try {
        return data.video_count
          ? {
              data: {
                video_previews: await this.fetch.fetchProductsInfo(
                  extraMetaUrl,
                  this.config.targetFields.extraMeta,
                ),
              },
            }
          : { data: { video_previews: [] } };
      } catch (error) {
        console.log(error);
      }
    });
  }

  createWriteStream(itemCount: number) {
    return new WriteFileStream(
      this.config.file.name,
      this.config.file.type,
      { itemCount: itemCount },
      {
        objectMode: true,
      },
    );
  }

  setConfig(config: { [key: string]: any }) {
    this.config = config;
  }

  showErrorMessage(reason: string, stopProcess?: boolean) {
    console.log(reason);
    if (stopProcess) {
      process.exit(1);
    }
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
