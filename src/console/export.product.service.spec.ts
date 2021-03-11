import { Test, TestingModule } from '@nestjs/testing';
import { ExportProductService } from './export.products.service';
import { HttpModule, HttpService } from '@nestjs/common';
import { ConfigManager } from './lib/ConfigManager';
import { FetchProducts } from './lib/FetchProducts';
import { TransformData } from './lib/TransformDataStream';
import { WriteFileStream } from './lib/WriteFileStream';
import { Readable } from 'stream';
import * as fs from 'fs';
import * as consoleTypes from './lib/types';

describe('ExportProductService', () => {
  let service: ExportProductService,
    configSettings: consoleTypes.ExportProductsConfigSettings,
    products: Promise<any>,
    transformTestFile: any,
    exportTestFile: any,
    writeTestFile: any;

  const Config: ConfigManager = new ConfigManager(
      `${process.cwd()}/iconic-cli.json`,
    ),
    Fetch: FetchProducts = new FetchProducts(new HttpService());

  const readTestFile = (fileName) => {
    return new Promise((resolve, reject) => {
      fs.readFile(`${process.cwd()}/${fileName}`, 'utf8', (err, data) => {
        if (err) {
          // no file present
          reject(false);
        } else {
          // file present already initialised
          resolve(data);
        }
      });
    });
  };

  const productsRecieved = [
    {
      name: 'sampleProduct',
      video_count: 0,
    },
    {
      name: 'dummyProduct',
      video_count: 0,
    },
    {
      name: 'sampleProduct2',
      video_count: 1,
    },
    {
      name: 'sampleProduct3',
      video_count: 1,
    },
  ];

  const productsToWrite = [
    {
      name: 'sampleProduct',
      video_count: 0,
    },
    {
      name: 'dummyProduct',
      video_count: 0,
    },
    {
      name: 'sampleProduct2',
      video_count: 1,
    },
    {
      name: 'sampleProduct3',
      video_count: 1,
    },
  ];

  const productsToTransformWrite = [
    {
      name: 'sampleProduct3',
      video_count: 1,
      video_previews: [
        {
          url: "'https://sample-test-video-mp3-sampleProduct3.com'",
          _links: {
            self: {
              href:
                'https://eve.theiconic.com.au/catalog/products/sampleProduct3/videos',
            },
          },
        },
      ],
    },
    {
      name: 'sampleProduct2',
      video_count: 1,
      video_previews: [
        {
          url: "'https://sample-test-video-mp3-sampleProduct2.com'",
          _links: {
            self: {
              href:
                'https://eve.theiconic.com.au/catalog/products/sampleProduct2/videos',
            },
          },
        },
      ],
    },
    {
      name: 'dummyProduct',
      video_count: 0,
      video_previews: [],
    },
    {
      name: 'sampleProduct',
      video_count: 0,
      video_previews: [],
    },
  ];

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExportProductService],
      imports: [HttpModule],
    }).compile();

    (service = module.get<ExportProductService>(ExportProductService)),
      (configSettings = await Config.getConfig('ExportProductService')),
      service.setConfig(configSettings);

    await service.exportProducts();

    products = await Fetch.fetchProductsInfo(
      configSettings.productCatalogUrl,
      configSettings.targetFields.products,
    );

    const writeStream = new WriteFileStream(
      'output-write-test.json',
      'json',
      { itemCount: 4 },
      {
        objectMode: true,
      },
    );

    /*** --- testing the writeStream
     * test on file that will be written
     */
    const readableStream = new Readable({ objectMode: true });
    // push to the reable stream
    productsToWrite.forEach((product: { [key: string]: any }) => {
      readableStream.push(product);
    });

    readableStream.push(null); // push null to close the stream as its finished
    readableStream.pipe(writeStream);

    /*** --- testing the transform indcluding write stream
     * test on file that will be written
     */

    // push to the reable stream
    /* here using productsReceived array because this was sorted in above test as javascript
     * sort functions pushes to the parent
     */
    const readableTransformStream = new Readable({ objectMode: true }),
      writeTransformStream = new WriteFileStream(
        'output-transform-write-test.json',
        'json',
        { itemCount: 4 },
        {
          objectMode: true,
        },
      );

    productsToTransformWrite.forEach((product: { [key: string]: any }) => {
      readableTransformStream.push(product);
    });
    readableTransformStream.push(null); // push null to close the stream as its finished

    const transformStream = new TransformData(
      { objectMode: true },
      async (data) => {
        try {
          return data.video_count
            ? {
                data: {
                  video_previews: [
                    {
                      url: `'https://sample-test-video-mp3-${data.name}.com'`,
                      _links: {
                        self: {
                          href: `https://eve.theiconic.com.au/catalog/products/${data.name}/videos`,
                        },
                      },
                    },
                  ],
                },
              }
            : { data: { video_previews: [] } };
        } catch (error) {}
      },
    );

    readableTransformStream
      .pipe(transformStream) // transfrom data
      .pipe(writeTransformStream);
  });

  afterAll(async () => {
    (transformTestFile = await readTestFile(
      `output-transform-write-test.json`,
    )),
      (writeTestFile = await readTestFile(`output-write-test.json`)),
      (exportTestFile = await readTestFile(`out.json`));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fetch list of products', async () => {
    expect(JSON.stringify(await service.getProducts())).toMatch(
      JSON.stringify(products),
    );
  });

  it('should sort products by video_count by decending order', async () => {
    expect(await service.sortProductsBy(productsRecieved)).toMatchSnapshot();
  });

  it('should write in a json file', async () => {
    expect(writeTestFile).toMatchSnapshot();
  });

  it('should transform and then write in a json file', async () => {
    expect(transformTestFile).toMatchSnapshot();
  });

  it('should get the product from the api, transform and write to a json file output.json', async () => {
    // this is may not be correct when the api gives different result please update the snap shot
    expect(JSON.stringify(exportTestFile)).toMatchSnapshot();
  });
});
