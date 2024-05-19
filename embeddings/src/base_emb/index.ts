import { OpenAI } from 'openai';
import { join } from 'node:path';
import { readFileSync, writeFileSync } from 'node:fs';

const openai = new OpenAI();

export type DataEmbeddings = {
  input: string;
  embeddings: number[];
};

export const generateEmbeddings = async (input: string | string[]) => {
  const resp = await openai.embeddings.create({
    input: input,
    model: 'text-embedding-3-small',
  });
  console.dir(resp, { depth: 8 });
  return resp;
};

export const loadJSONData = <T>(fileName: string): T => {
  const path = join(__dirname, fileName);
  const rawData = readFileSync(path);
  return JSON.parse(rawData.toString());
};

const saveDataToJson = (data: any, fileName: string) => {
  const dataString = JSON.stringify(data);
  const dataBuffer = Buffer.from(dataString);
  const path = join(__dirname, fileName);
  writeFileSync(path, dataBuffer);
  console.log(`Saved to ${fileName}`);
};

const main = async () => {
  const data = loadJSONData<string[]>('data.json');
  const embeddings = await generateEmbeddings(data);
  const dataWithEmbeddings: DataEmbeddings[] = [];
  for (let i = 0; i < data.length; i++) {
    dataWithEmbeddings.push({
      input: data[i],
      embeddings: embeddings.data[i].embedding,
    });
  }
  saveDataToJson(dataWithEmbeddings, 'dataWithEmbeddings.json');
};

main();
