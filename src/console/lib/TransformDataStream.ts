import { Transform, TransformCallback, TransformOptions } from 'stream';

export class TransformData extends Transform {
  constructor(
    options: TransformOptions,
    private addCallBack?: (data) => Promise<{ data: any }>,
  ) {
    super(options);
  }

  async _transform(
    chunk: any,
    encoding: BufferEncoding,
    callback: TransformCallback,
  ): Promise<void> {
    if (this.addCallBack) {
      const { data } = await this.addCallBack(chunk);
      chunk = { ...chunk, ...data };
    }
    this.push(chunk);
    callback();
  }
}
