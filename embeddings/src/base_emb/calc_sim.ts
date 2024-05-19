import { DataEmbeddings, generateEmbeddings, loadJSONData } from './index';

export const dotProductSim = (a: number[], b: number[]) =>
  a.map((value, index) => value * b[index]).reduce((a, b) => a + b, 0);

export const cosineSim = (a: number[], b: number[]) => {
  const product = dotProductSim(a, b);
  const aMagnitude = Math.sqrt(
    a.map((value) => value ** 2).reduce((a, b) => a + b, 0)
  );
  const bMagnitude = Math.sqrt(
    b.map((value) => value ** 2).reduce((a, b) => a + b, 0)
  );
  return product / (aMagnitude * bMagnitude);
};

const main = async () => {
  const dataWithEmbeddings = loadJSONData<DataEmbeddings[]>(
    'dataWithEmbeddings.json'
  );

  const input = 'cat';
  const inputEmbedding = await generateEmbeddings(input);

  const similarities: {
    input: string;
    similarity: number;
  }[] = [];

  for (const entry of dataWithEmbeddings) {
    const similarity = cosineSim(
      entry.embeddings,
      inputEmbedding.data[0].embedding
    );
    similarities.push({ input: entry.input, similarity });
  }

  const sortedSimilarities = similarities.sort(
    (a, b) => b.similarity - a.similarity
  );
  sortedSimilarities.forEach((similarity) => {
    console.log(`${similarity.input}: ${similarity.similarity}`);
  });
};

main();
