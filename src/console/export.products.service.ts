import { Injectable, HttpService } from '@nestjs/common';
import { FetchProducts } from './lib/FetchProducts';
import { Readable } from 'stream';
import { TransformData } from './lib/TransformDataStream';
import { WriteFileStream } from './lib/WriteFileStream';
import * as consoleApp from './lib/types';

@Injectable()
export class ExportProductService {
  private fetch: FetchProducts;
  private config: { [key: string]: any };
  constructor(private httpService: HttpService) {
    this.fetch = new FetchProducts(this.httpService);
  }

  async getProducts(): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        const products: Array<consoleApp.Products> = await this.fetch.fetchProductsInfo(
          this.config.productCatalogUrl,
          this.config.targetFields.products,
        );
        if (!products || !products.length) {
          this.showErrorMessage('No products to export', true);
        }

        resolve(products);
      } catch (error) {
        this.showErrorMessage(error.message, true);
        reject(error);
      }
    });
  }

  async exportProducts() {
    const readableStream = new Readable({ objectMode: true });
    let sortedProducts: Array<consoleApp.Products>;
    try {
      // get the initial products
      const products: Array<consoleApp.Products> = await this.getProducts();
      // sort the products
      sortedProducts = await this.sortProductsBy(
        products,
        this.config.file.sort.byField, // uses the config
        this.config.file.sort.sortOrder, // uses the config
      );
    } catch (error) {
      console.log(error.message);
    }

    if (!sortedProducts || !sortedProducts.length) {
      this.showErrorMessage('No products to export', true);
    }

    // push to the reable stream
    sortedProducts.forEach((product: consoleApp.Products) => {
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

  setConfig(config: consoleApp.ExportProductsConfigSettings) {
    this.config = config;
  }

  showErrorMessage(reason: string, stopProcess?: boolean) {
    console.log(reason);
    if (stopProcess) {
      process.exit(1);
    }
  }

  sortProductsBy(
    products: Array<consoleApp.Products>,
    byField: string | number = 'video_count',
    sortType: consoleApp.DESC | consoleApp.ASC = 'DESC',
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
