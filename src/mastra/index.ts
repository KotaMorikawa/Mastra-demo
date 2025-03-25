import { Mastra } from "@mastra/core/mastra";
import { createLogger } from "@mastra/core/logger";
import { cursorRulesWorkflow } from "./workflows";
import { cursorRulesAgent } from "./agents";

export const mastra = new Mastra({
  workflows: { cursorRulesWorkflow },
  agents: { cursorRulesAgent },
  logger: createLogger({
    name: "Github Cursor Rules Agent",
    level: "info",
  }),
});
