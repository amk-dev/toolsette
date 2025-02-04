import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const createOrgRepoSchema = z.object({
  // Path parameter
  org: z.string().describe("The organization name. The name is not case sensitive."),
  // Request body parameters
  name: z.string().describe("The name of the repository."),
  description: z.string().optional().describe("A short description of the repository."),
  homepage: z.string().optional().describe("A URL with more information about the repository."),
  private: z.boolean().optional().default(false).describe("Whether the repository is private."),
  visibility: z.enum(["public", "private"]).optional().describe("The visibility of the repository."),
  has_issues: z
    .boolean()
    .optional()
    .default(true)
    .describe("Either `true` to enable issues for this repository or `false` to disable them."),
  has_projects: z
    .boolean()
    .optional()
    .default(true)
    .describe("Either `true` to enable projects for this repository or `false` to disable them. Note: if you're creating a repository in an organization that has disabled repository projects, the default is `false`, and if you pass `true`, the API returns an error."),
  has_wiki: z
    .boolean()
    .optional()
    .default(true)
    .describe("Either `true` to enable the wiki for this repository or `false` to disable it."),
  has_downloads: z
    .boolean()
    .optional()
    .default(true)
    .describe("Whether downloads are enabled."),
  is_template: z
    .boolean()
    .optional()
    .default(false)
    .describe("Either `true` to make this repo available as a template repository or `false` to prevent it."),
  team_id: z
    .number()
    .int()
    .optional()
    .describe("The id of the team that will be granted access to this repository. This is only valid when creating a repository in an organization."),
  auto_init: z
    .boolean()
    .optional()
    .default(false)
    .describe("Pass `true` to create an initial commit with empty README."),
  gitignore_template: z
    .string()
    .optional()
    .describe("Desired language or platform .gitignore template to apply. Use the name of the template without the extension. For example, 'Haskell'."),
  license_template: z
    .string()
    .optional()
    .describe("Choose an open source license template that best suits your needs, and then use the license keyword as the license_template string. For example, 'mit' or 'mpl-2.0'."),
  allow_squash_merge: z
    .boolean()
    .optional()
    .default(true)
    .describe("Either `true` to allow squash-merging pull requests, or `false` to prevent squash-merging."),
  allow_merge_commit: z
    .boolean()
    .optional()
    .default(true)
    .describe("Either `true` to allow merging pull requests with a merge commit, or `false` to prevent merging pull requests with merge commits."),
  allow_rebase_merge: z
    .boolean()
    .optional()
    .default(true)
    .describe("Either `true` to allow rebase-merging pull requests, or `false` to prevent rebase-merging."),
  allow_auto_merge: z
    .boolean()
    .optional()
    .default(false)
    .describe("Either `true` to allow auto-merge on pull requests, or `false` to disallow auto-merge."),
  delete_branch_on_merge: z
    .boolean()
    .optional()
    .default(false)
    .describe(
      "Either `true` to allow automatically deleting head branches when pull requests are merged, or `false` to prevent automatic deletion. The authenticated user must be an organization owner to set this property to `true`."
    ),
  use_squash_pr_title_as_default: z
    .boolean()
    .optional()
    .default(false)
    .describe("Either `true` to allow squash-merge commits to use pull request title, or `false` to use commit message. (Deprecated: please use `squash_merge_commit_title` instead)"),
  squash_merge_commit_title: z
    .enum(["PR_TITLE", "COMMIT_OR_PR_TITLE"])
    .optional()
    .describe(
      "Default value for a squash merge commit title. Options: 'PR_TITLE' defaults to the pull request's title; 'COMMIT_OR_PR_TITLE' defaults to the commit's title (if only one commit) or the pull request's title (when more than one commit)."
    ),
  squash_merge_commit_message: z
    .enum(["PR_BODY", "COMMIT_MESSAGES", "BLANK"])
    .optional()
    .describe(
      "Default value for a squash merge commit message. Options: 'PR_BODY' to default to the pull request's body; 'COMMIT_MESSAGES' to default to the branch's commit messages; 'BLANK' for a blank commit message."
    ),
  merge_commit_title: z
    .enum(["PR_TITLE", "MERGE_MESSAGE"])
    .optional()
    .describe(
      "Default value for a merge commit title. Options: 'PR_TITLE' to default to the pull request's title; 'MERGE_MESSAGE' to default to the classic merge message."
    ),
  merge_commit_message: z
    .enum(["PR_BODY", "PR_TITLE", "BLANK"])
    .optional()
    .describe(
      "Default value for a merge commit message. Options: 'PR_TITLE' to default to the pull request's title; 'PR_BODY' to default to the pull request's body; 'BLANK' for a blank commit message."
    ),
  custom_properties: z
    .record(z.any())
    .optional()
    .describe("The custom properties for the new repository. The keys are the custom property names, and the values are the corresponding custom property values.")
});

type CreateOrgRepoInput = z.infer<typeof createOrgRepoSchema>;

async function createOrgRepoFunction(
  input: CreateOrgRepoInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Separate the organization from the request body properties
    const { org, ...body } = input;
    const url = `https://api.github.com/orgs/${encodeURIComponent(org)}/repos`;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    // Create the repository by sending a POST request.
    const response = await ofetch(url, {
      method: "POST",
      body,
      headers,
      // Return the response as a JSON string
      parseResponse: (res) => JSON.stringify(res),
    });

    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to create organization repository"));
  }
}

export const createOrgRepo: ToolsetteTool = {
  name: "create_org_repo",
  description:
    "Creates a new repository in the specified organization. The authenticated user must be a member of the organization.\n\nOAuth app tokens and personal access tokens (classic) need the `public_repo` or `repo` scope to create a public repository, and `repo` scope to create a private repository.",
  parameters: createOrgRepoSchema,
  function: createOrgRepoFunction,
};