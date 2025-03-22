import { createTool } from "@mastra/core/tools";
import { exec } from "child_process";
import path from "path";
import { promisify } from "util";
import { z } from "zod";
import fs from "fs";

const execAsync = promisify(exec);

/**
 * Clone a repository from GitHub
 */
export const cloneOutputSchema = z
  .object({
    success: z.boolean().describe("クローン操作が成功したかどうか"),
    message: z.string().describe("操作結果の詳細メッセージ"),
    repositoryFullPath: z
      .string()
      .optional()
      .describe("クローンされたリポジトリの絶対パス（フルパス）"),
    cloneDirectoryName: z
      .string()
      .optional()
      .describe("クローン先のディレクトリ名（相対パス）"),
  })
  .describe("リポジトリクローン操作の結果");

/**
 * リポジトリをクローンするツール
 * LFS対応とサブモジュール処理も可能
 */
export const cloneRepositoryTool = createTool({
  id: "clone-repository",
  description:
    "Githubリポジトリをクローンして、コード解析やファイフ処理を可能にします。",
  inputSchema: z.object({
    repositoryUrl: z
      .string()
      .describe(
        "リポジトリのURL（例: https://github.com/user/repo）- クローンするGitHubリポジトリを指定します"
      ),
    branch: z
      .string()
      .optional()
      .describe(
        "クローンするブランチ名。指定しない場合はデフォルトブランチになります。特定の機能に関するコードだけを分析したい場合に指定します"
      ),
    includeLfs: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "Git LFSファイルも取得するか - 大規模なプロジェクトで依存リポジトリも分析したい場合はtrueにします"
      ),
    includeSubmodules: z
      .boolean()
      .optional()
      .default(false)
      .describe(
        "サブモジュールも取得するか - 大規模なプロジェクトで依存リポジトリも分析したい場合はtrueにします"
      ),
  }),
  outputSchema: cloneOutputSchema,
  execute: async ({ context }) => {
    const { repositoryUrl, branch, includeLfs, includeSubmodules } = context;

    try {
      // リポジトリ名を取得
      const repoName =
        repositoryUrl.split("/").pop()?.replace(".git", "") || "repo";
      const cloneDir = repoName;
      const fullPath = path.resolve(process.cwd(), cloneDir);

      // ディレクトリが既に存在するか確認
      if (fs.existsSync(fullPath)) {
        return {
          success: true,
          message: `ディレクトリ ${cloneDir} は既に存在するため、クローンをスキップします`,
          repositoryFullPath: fullPath,
          cloneDirectoryName: cloneDir,
        };
      }
      // クローンコマンドを実行
      let command = `git clone ${repositoryUrl}`;

      // ブランチが指定されている場合
      if (branch) {
        command += ` --branch ${branch}`;
      }

      // サブモジュールが必要な場合
      if (includeSubmodules) {
        command += " --recurse-submodules";
      }

      // ターゲットディレクトリを指定
      command += ` ${cloneDir}`;

      // コマンドを実行
      const { stdout, stderr } = await execAsync(command);

      // LFSファイルが必要な場合
      if (includeLfs) {
        try {
          // ディレクトリに移動してLFSファイルを取得
          await execAsync(`cd ${cloneDir} && git lfs pull`);
        } catch (error: any) {
          return {
            success: true,
            message: `リポジトリのクローンに成功しましたが、LFSファイルの取得に失敗しました: ${error.message}`,
            repositoryFullPath: fullPath,
            cloneDirectoryName: cloneDir,
          };
        }
      }

      // 成功時のレスポンス
      return {
        success: true,
        message: `リポジトリを ${fullPath} にクローンしました`,
        repositoryFullPath: fullPath,
        cloneDirectoryName: cloneDir,
      };
    } catch (error: any) {
      // ダミー値としてプロセス作業ディレクトリと"repo"を返す
      const dummyCloneDir = "repo";
      const dummyFullPath = path.resolve(process.cwd(), dummyCloneDir);

      console.error(`クローンエラー: ${error.message}`);
      console.error(
        `デバッグ情報: リポジトリURL=${repositoryUrl}、ブランチ=${branch || "default"}`
      );

      return {
        success: false,
        message: `リポジトリのクローンに失敗しました: ${error.message}`,
        repositoryFullPath: dummyFullPath,
        cloneDirectoryName: dummyCloneDir,
      };
    }
  },
});
