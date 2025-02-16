import got from 'got';
import {appendFile} from 'node:fs/promises';

import {MockServerData} from '../../shared/types';
import {TsvOfferGenerator} from '../../shared/libs/offer-generator';

import {Command} from './command.interface';


export class GenerateCommand implements Command {
  private initialData: MockServerData;

  private async load(url: string) {
    try {
      this.initialData = await got.get(url).json();
    } catch {
      throw new Error(`Can't load data from ${url}`);
    }
  }

  private async write (filepath: string, offerCount: number) {
    const tsxOfferGenerator = new TsvOfferGenerator(this.initialData);

    for(let i = 0; i < offerCount; i++) {
      await appendFile(
        filepath,
        `${tsxOfferGenerator.generate()}\n`,
        { encoding: 'utf-8' }
      );
    }
  }

  public getName(): string {
    return '--generate';
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [count, filepath, url] = parameters;
    const offerCount = Number.parseInt(count, 10);

    try {
      await this.load(url);
      await this.write(filepath, offerCount);

      console.info(`File ${filepath} was created`);
    } catch (error) {
      console.error('Can\'t generate data');

      if (error instanceof Error) {
        console.error(error.message);
      }
    }
  }
}
