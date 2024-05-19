import { CreateEmbeddingResponse } from 'openai/resources';
import { generateEmbeddings } from '../base_emb';
import {
  checkExists,
  generatePath,
  loadJSONData,
  saveDataToJson,
} from './utils';
import { dotProductSim } from '../base_emb/calc_sim';

interface IMovie {
  name: string;
  description: string;
}

interface IMovieWithEmb extends IMovie {
  embedding: number[];
}

const EMB_FILE_NAME = 'moviesEmbeddings.json';
const moviesData = loadJSONData<IMovie[]>(generatePath(__dirname, 'data.json'));

process.stdin.addListener('data', async (input) => {
  console.log(input);
  recommengMovies(input.toString().trim());
});

const recommengMovies = async (input: string) => {
  const inputEmbedding = await generateEmbeddings(input);
  const movieDescEmbeddings = await getMoviesDescEmbeddings();

  const moviesWithEmb: IMovieWithEmb[] = [];
  for (let i = 0; i < moviesData.length; i++) {
    moviesWithEmb.push({
      name: moviesData[i].name,
      description: moviesData[i].description,
      embedding: movieDescEmbeddings.data[i].embedding,
    });
  }

  const similarities: { input: string; similarity: number }[] = [];

  for (const movie of moviesWithEmb) {
    const similarity = dotProductSim(
      movie.embedding,
      inputEmbedding.data[0].embedding
    );
    similarities.push({
      input: movie.name,
      similarity,
    });
  }

  const sortedSimilarity = similarities.sort(
    (a, b) => b.similarity - a.similarity
  );
  sortedSimilarity.forEach((similarity) => {
    console.log(`${similarity.input}: ${similarity.similarity}`);
  });
};

const getMoviesDescEmbeddings = async () => {
  const filePath = generatePath(__dirname, EMB_FILE_NAME);
  const fileExists = checkExists(filePath);

  if (fileExists) {
    const movieDescEmb = loadJSONData<CreateEmbeddingResponse>(filePath);
    return movieDescEmb;
  } else {
    const movieDescEmb = await generateEmbeddings(
      moviesData.map((movie) => movie.description)
    );
    saveDataToJson(movieDescEmb, EMB_FILE_NAME);
    return movieDescEmb;
  }
};
