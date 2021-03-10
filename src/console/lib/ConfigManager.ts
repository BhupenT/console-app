import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
@Injectable()
export class ConfigManager {
  constructor(private readonly configPath: string) {}

  getConfig(className: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.configPath, 'utf8', (err, data) => {
        if (err) {
          // no file present
          reject(false);
        } else {
          // file present already initialised
          resolve(JSON.parse(data)[className]);
        }
      });
    });
  }

  createConfig(
    path: string,
    content: any,
  ): Promise<{ saved: boolean; text: any } | NodeJS.ErrnoException> {
    return new Promise((resolve, reject) => {
      fs.writeFile(path, content, (err) => {
        if (err) {
          reject(err);
        }
        resolve({
          saved: true,
          text: content,
        });
      });
    });
  }
}
