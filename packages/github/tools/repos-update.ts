import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Input schema combining the path parameters and the (optional) request body properties
const updateRepoSchema = z.object({
  // Path parameters
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive."),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  // Request body properties (all optional because the request body is not required)
  name: z.string().optional().describe("The name of the repository."),
  description: z.string().optional().describe("A short description of the repository."),
  homepage: z.string().optional().describe("A URL with more information about the repository."),
  private: z.boolean().optional().default(false).describe("Either `true` to make the repository private or `false` to make it public. Default: `false`. Note: You will get a 422 error if the organization restricts changing repository visibility."),
  visibility: z.enum(["public", "private"]).optional().describe("The visibility of the repository."),
  security_and_analysis: z.union([
    z.object({
      advanced_security: z
        .object({
          status: z
            .enum(["enabled", "disabled"])
            .optional()
            .describe("Use the `status` property to enable or disable GitHub Advanced Security for this repository. Can be `enabled` or `disabled`."),
        })
        .optional(),
      secret_scanning: z
        .object({
          status: z.enum(["enabled", "disabled"]).optional(),
        })
        .optional(),
      secret_scanning_push_protection: z
        .object({
          status: z.enum(["enabled", "disabled"]).optional(),
        })
        .optional(),
      secret_scanning_ai_detection: z
        .object({
          status: z.enum(["enabled", "disabled"]).optional(),
        })
        .optional(),
      secret_scanning_non_provider_patterns: z
        .object({
          status: z.enum(["enabled", "disabled"]).optional(),
        })
        .optional(),
    }),
    z.null()
  ])
    .optional()
    .describe("Specify which security and analysis features to enable or disable for the repository."),
  has_issues: z.boolean().optional().default(true).describe("Either `true` to enable issues for this repository or `false` to disable them."),
  has_projects: z.boolean().optional().default(true).describe("Either `true` to enable projects for this repository or `false` to disable them. Note: If you're creating a repository in an organization that has disabled repository projects, the default is `false`, and if you pass `true`, the API returns an error."),
  has_wiki: z.boolean().optional().default(true).describe("Either `true` to enable the wiki for this repository or `false` to disable it."),
  is_template: z.boolean().optional().default(false).describe("Either `true` to make this repo available as a template repository or `false` to prevent it."),
  default_branch: z.string().optional().describe("Updates the default branch for this repository."),
  allow_squash_merge: z.boolean().optional().default(true).describe("Either `true` to allow squash-merging pull requests, or `false` to prevent squash-merging."),
  allow_merge_commit: z.boolean().optional().default(true).describe("Either `true` to allow merging pull requests with a merge commit, or `false` to prevent merging pull requests with merge commits."),
  allow_rebase_merge: z.boolean().optional().default(true).describe("Either `true` to allow rebase-merging pull requests, or `false` to prevent rebase-merging."),
  allow_auto_merge: z.boolean().optional().default(false).describe("Either `true` to allow auto-merge on pull requests, or `false` to disallow auto-merge."),
  delete_branch_on_merge: z.boolean().optional().default(false).describe("Either `true` to allow automatically deleting head branches when pull requests are merged, or `false` to prevent automatic deletion."),
  allow_update_branch: z.boolean().optional().default(false).describe("Either `true` to always allow a pull request head branch that is behind its base branch to be updated even if it is not required to be up to date before merging, or false otherwise."),
  use_squash_pr_title_as_default: z.boolean().optional().default(false).describe("Either `true` to allow squash-merge commits to use pull request title, or `false` to use commit message. This property is closing down. Please use `squash_merge_commit_title` instead."),
  squash_merge_commit_title: z
    .enum(["PR_TITLE", "COMMIT_OR_PR_TITLE"])
    .optional()
    .describe(
      "The default value for a squash merge commit title. 'PR_TITLE' defaults to the pull request's title; 'COMMIT_OR_PR_TITLE' defaults to the commit's title (if only one commit) or the pull request's title (when more than one commit)."
    ),
  squash_merge_commit_message: z
    .enum(["PR_BODY", "COMMIT_MESSAGES", "BLANK"])
    .optional()
    .describe(
      "The default value for a squash merge commit message. 'PR_BODY' defaults to the pull request's body; 'COMMIT_MESSAGES' defaults to the branch's commit messages; 'BLANK' defaults to a blank commit message."
    ),
  merge_commit_title: z
    .enum(["PR_TITLE", "MERGE_MESSAGE"])
    .optional()
    .describe(
      "The default value for a merge commit title. 'PR_TITLE' defaults to the pull request's title; 'MERGE_MESSAGE' defaults to the classic title for a merge message."
    ),
  merge_commit_message: z
    .enum(["PR_BODY", "PR_TITLE", "BLANK"])
    .optional()
    .describe(
      "The default value for a merge commit message. 'PR_TITLE' defaults to the pull request's title; 'PR_BODY' defaults to the pull request's body; 'BLANK' defaults to a blank commit message."
    ),
  archived: z.boolean().optional().default(false).describe("Whether to archive this repository. `false` will unarchive a previously archived repository."),
  allow_forking: z.boolean().optional().default(false).describe("Either `true` to allow private forks, or `false` to prevent private forks."),
  web_commit_signoff_required: z.boolean().optional().default(false).describe("Either `true` to require contributors to sign off on web-based commits, or `false` to not require contributors to sign off on web-based commits.")
});

export type UpdateRepoInput = z.infer<typeof updateRepoSchema>;

async function updateRepoFunction(
  input: UpdateRepoInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<any, Error>> {
  try {
    if (!metadata.auth || !metadata.auth.apiKey) {
      return err(new Error("Missing API key"));
    }

    // Extract path parameters and the remaining properties for the request body
    const { owner, repo, ...body } = input;

    const response = await ofetch(`https://api.github.com/repos/${owner}/${repo}`, {
      method: "PATCH",
      body,
      headers: {
        "Authorization": `Bearer ${metadata.auth.apiKey}`,
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
      }
    });
    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to update repository"));
  }
}

export const updateRepo: ToolsetteTool = {
  name: "update_repo",
  description:
    "Update a repository. Note: To edit a repository's topics, use the Replace all repository topics endpoint. API method documentation: https://docs.github.com/rest/repos/repos#update-a-repository",
  parameters: updateRepoSchema,
  function: updateRepoFunction
};