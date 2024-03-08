import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import * as stream from 'stream';
import { once } from 'events';

export const parseFilesLineByLine = async (filename: string) => {
  const lines: string[] = [];

  const pathToFile = path.resolve(`${filename}`);

  const instream = fs.createReadStream(pathToFile);
  const outstream = new stream.Writable();

  const rl = readline.createInterface(instream, outstream);

  rl.on('line', (line: string) => {
    lines.push(line);
  });

  await once(rl, 'close');

  return lines;
};

export const importETHWallets = async () => {
  return parseFilesLineByLine('input/privates.txt');
};

export const importProxies = async () => {
  return parseFilesLineByLine(`input/proxies.txt`);
};

export const importNames = async () => {
  return parseFilesLineByLine(`input/names.txt`);
};
