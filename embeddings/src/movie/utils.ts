import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'node:path';

export const generatePath = (dirname: string, fileName: string) =>
  join(dirname, fileName);

export const checkExists = (path: string) => existsSync(path);

export const loadJSONData = <T>(path: string): T => {
  const rawData = readFileSync(path);
  return JSON.parse(rawData.toString());
};

export const saveDataToJson = (data: any, fileName: string) => {
  const dataString = JSON.stringify(data);
  const dataBuffer = Buffer.from(dataString);
  const path = join(__dirname, fileName);
  writeFileSync(path, dataBuffer);
  console.log(`Saved to ${fileName}`);
};
