// import { google } from "@ai-sdk/google";
import { Agent } from "@mastra/core/agent";
import { weatherTool } from "../tools";
import { google } from "../models";
import { cloneRepositoryTool } from "../tools/github/cloneRepository";
// export const weatherAgent = new Agent({
//   name: 'Weather Agent',
//   instructions: `
//       You are a helpful weather assistant that provides accurate weather information.

//       Your primary function is to help users get weather details for specific locations. When responding:
//       - Always ask for a location if none is provided
//       - If the location name isn’t in English, please translate it
//       - If giving a location with multiple parts (e.g. "New York, NY"), use the most relevant part (e.g. "New York")
//       - Include relevant details like humidity, wind conditions, and precipitation
//       - Keep responses concise but informative

//       Use the weatherTool to fetch current weather data.
// `,
//   model: google('gemini-1.5-pro-latest'),
//   tools: { weatherTool },
// });

const geminiAgent = new Agent({
  name: "GitHub Analysis Agent",
  instructions:
    "GitHubリポジトリを解析するエージェントです。リポジトリのURLを指定すると、それをクローンして解析できます。",
  model: google("gemini-2.0-flash-001"),
  tools: { cloneRepositoryTool },
});
