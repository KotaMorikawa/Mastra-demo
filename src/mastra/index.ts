import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { weatherWorkflow, cursorRulesWorkflow } from "./workflows";
import { weatherAgent, cursorRulesAgent } from "./agents";

export const mastra = new Mastra({
  workflows: { weatherWorkflow, cursorRulesWorkflow },
  agents: { weatherAgent, cursorRulesAgent },
  logger: createLogger({
    name: "Github Cursor Rules Agent",
    level: "info",
  }),
});
