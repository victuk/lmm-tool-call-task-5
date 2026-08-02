import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import {
  getFlightBookingSchedule,
  getHotelBookingSchedule,
  convertCurrency,
} from "./services.js";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.LLM_MODEL_NAME || "gemini-2.5-flash";

const ai = new GoogleGenAI({ apiKey });

const toolImplementations = {
  get_flight_booking_schedule: getFlightBookingSchedule,
  get_hotel_booking_schedule: getHotelBookingSchedule,
  convert_currency: convertCurrency,
};

const toolsDeclaration = [
  {
    functionDeclarations: [
      {
        name: "get_flight_booking_schedule",
        description: "Returns flight duration and price in USD",
        parameters: {
          type: Type.OBJECT,
          properties: {
            origin: {
              type: Type.STRING,
              description: "Origin city or airport code (e.g., Lagos, LOS)",
            },
            destination: {
              type: Type.STRING,
              description:
                "Destination city or airport code (e.g., Nairobi, NBO)",
            },
          },
          required: ["origin", "destination"],
        },
      },
      {
        name: "get_hotel_booking_schedule",
        description: "Returns hotel options with price per night in USD",
        parameters: {
          type: Type.OBJECT,
          properties: {
            location: {
              type: Type.STRING,
              description: "City or area for hotel stay (e.g., Nairobi)",
            },
            nights: {
              type: Type.INTEGER,
              description: "Total number of nights to stay",
            },
          },
          required: ["location", "nights"],
        },
      },
      {
        name: "convert_currency",
        description: "Convert between currencies",
        parameters: {
          type: Type.OBJECT,
          properties: {
            amount: {
              type: Type.NUMBER,
              description: "The amount of money to convert",
            },
            fromCurrency: {
              type: Type.STRING,
              description:
                "Source 3-letter currency code (e.g., USD, NGN, KES)",
            },
            toCurrency: {
              type: Type.STRING,
              description:
                "Target 3-letter currency code (e.g., KES, NGN, USD)",
            },
          },
          required: ["amount", "fromCurrency", "toCurrency"],
        },
      },
    ],
  },
];

async function runAgent() {
  const prompt =
    "I'm taking a flight from Lagos to Nairobi for a conference. I would like to know the total flight time back and forth, and the total cost of logistics for this conference if I'm staying for three days.";

  const chat = ai.chats.create({
    model: modelName,
    config: {
      tools: toolsDeclaration,
    },
  });

  let response = await chat.sendMessage({ message: prompt });

  while (response.functionCalls && response.functionCalls.length > 0) {
    const functionResponseParts = [];

    for (const call of response.functionCalls) {
      const { id, name, args } = call;
      const fn = toolImplementations[name];
      const output = fn
        ? fn(args || {})
        : { error: `Function ${name} not found` };

      functionResponseParts.push({
        functionResponse: {
          id,
          name,
          response: output,
        },
      });
    }

    response = await chat.sendMessage({
      message: {
        role: "tool",
        parts: functionResponseParts,
      },
    });
  }

  console.log(response.text);
}

runAgent().catch(console.error);
