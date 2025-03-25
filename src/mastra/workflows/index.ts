import { Workflow } from "@mastra/core/workflows";
import { z } from "zod";

// カーソルルールのワークフロー
const cursorRulesWorkflow = new Workflow({
  name: "cursor-rules-workflow",
  triggerSchema: z.object({
    repository: z.string().describe("GitHubリポジトリのURL"),
  }),
});

cursorRulesWorkflow.commit();

export { cursorRulesWorkflow };
