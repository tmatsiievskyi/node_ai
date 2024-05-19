import { OpenAI } from 'openai';

const openAI = new OpenAI();

function getTimeOfDay() {
  return '5:45';
}

function getOrderStatus(orderId: string) {
  console.log(`Getting the status of the order ${orderId}`);
  const orderAsNumber = parseInt(orderId);
  if (orderAsNumber % 2 == 0) {
    return 'IN_PROGRESS';
  }
  return 'COMPLETED';
}

async function callOpenAiWithTools() {
  const context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content:
        'Assitant that gives information about the time of day and order status',
    },
    {
      role: 'user',
      content: 'What is the status of order 1234?',
    },
  ];

  const response = await openAI.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: context,
    tools: [
      {
        type: 'function',
        function: {
          name: 'getTimeOfDay',
          description: 'Get the time of a day',
        },
      },
      {
        type: 'function',
        function: {
          name: 'getOrderStatus',
          description: 'Returns the status of an order',
          parameters: {
            type: 'object',
            properties: {
              orderId: {
                type: 'string',
                description: 'The id of the order to get the status of',
              },
            },
            required: ['orderid'],
          },
        },
      },
    ],
    tool_choice: 'auto',
  });
  //decide if tool is required
  const willInvokeFunction = response.choices[0].finish_reason === 'tool_calls';
  const toolCall = response.choices[0].message.tool_calls![0];

  if (willInvokeFunction) {
    const toolName = toolCall.function.name;

    if (toolName === 'getTimeOfDay') {
      const toolResponse = getTimeOfDay();
      context.push(response.choices[0].message);
      context.push({
        role: 'tool',
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }
    if (toolName === 'getOrderStatus') {
      const rawArgument = toolCall.function.arguments;
      const parsedArguments = JSON.parse(rawArgument);
      const toolResponse = getOrderStatus(parsedArguments.orderId);
      context.push(response.choices[0].message);
      context.push({
        role: 'tool',
        content: toolResponse,
        tool_call_id: toolCall.id,
      });
    }
  }

  const secondResponse = await openAI.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: context,
  });

  console.log(secondResponse.choices[0].message.content);
}

callOpenAiWithTools();
