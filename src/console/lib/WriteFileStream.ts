import { Writable, WritableOptions } from 'stream';
import { openSync, writeSync, closeSync } from 'fs';

type json = string;
type txt = string;
interface JsonOpts {
  open?: string;
  separator?: string;
  close?: string;
  itemCount: number;
}

export class WriteFileStream extends Writable {
  private counter = 1;
  options: JsonOpts;

  private open: number;
  constructor(
    public filePath: string,
    public fileType: json | txt,
    jsonOpts?: JsonOpts,
    options?: WritableOptions,
  ) {
    super(options);

    this.open = openSync(filePath, 'w');

    if (fileType === 'json' && !jsonOpts) {
      // adds default if not mentioned
      this.options = {
        open: '[\n',
        separator: ',\n',
        close: '\n]',
        itemCount: 0,
      };
    }
    if (jsonOpts) {
      this.options = {
        open: jsonOpts.open || '[\n',
        separator: jsonOpts.separator || ',\n',
        close: jsonOpts.close || '\n]',
        itemCount: jsonOpts.itemCount,
      };
    }
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null) => void,
  ): void {
    // console.log({ counter: this.counter, itemCount: this.options.itemCount });
    if ('json' === this.fileType) {
      switch (true) {
        case this.counter === 1: // adds open tag and separator
          this.writeToFile(chunk, true, true);
          break;

        case this.counter < this.options.itemCount: // adds separator only
          this.writeToFile(chunk, false, true);
          break;

        default:
          // adds nothing
          this.writeToFile(chunk, false, false);
          break;
      }
    } else {
      this.counter > 1
        ? this.writeToFile(chunk, false, true)
        : this.writeToFile(chunk, true, true);
    }

    this.counter++;
    callback();
  }

  _final(callback: (error?: Error | null) => void): void {
    if (this.options.close) {
      writeSync(this.open, this.options.close); // adds closing separator
    }
    closeSync(this.open);
    callback();
  }

  writeToFile(chunk: any, prepend?: boolean, append?: boolean): void {
    try {
      if (prepend && this.options.open) {
        writeSync(this.open, this.options.open);
      }
      writeSync(this.open, JSON.stringify(chunk, null, 2));
      if (append && this.options.separator) {
        writeSync(this.open, this.options.separator);
      }
    } catch (error) {
      closeSync(this.open);
    }
  }
}
