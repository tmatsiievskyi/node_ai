import { OpenAI } from 'openai';
import { encoding_for_model } from 'tiktoken';

const openai = new OpenAI({});

async function main() {
  const resp = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You respond in JSON format like this:
          height: ,
          your thoughts: ,
        `,
      },
      {
        role: 'user',
        content: 'How tall is mount Everest?',
      },
    ],
    n: 2,
    frequency_penalty: 1.5,
    seed: 555,
  });
  console.log(resp.choices[0].message.content);
}

function encodePrompt() {
  const prompt = 'How are you today?';
  const encoder = encoding_for_model('gpt-3.5-turbo');
  const words = encoder.encode(prompt);
  console.log(words);
}

main();
