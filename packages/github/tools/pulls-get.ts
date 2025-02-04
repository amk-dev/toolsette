import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Define the input schema for getting a pull request
const getPullRequestSchema = z.object({
  owner: z
    .string()
    .describe(
      "The account owner of the repository. The name is not case sensitive."
    ),
  repo: z
    .string()
    .describe(
      "The name of the repository without the `.git` extension. The name is not case sensitive."
    ),
  pull_number: z
    .number()
    .int()
    .describe("The number that identifies the pull request."),
});

type GetPullRequestInput = z.infer<typeof getPullRequestSchema>;

/**
 * Gets a pull request from GitHub by its number.
 *
 * Draft pull requests are available in public repositories with GitHub Free and GitHub Free for organizations,
 * GitHub Pro, and legacy per-repository billing plans, and in public and private repositories with GitHub Team
 * and GitHub Enterprise Cloud. This endpoint returns detailed information about a pull request.
 *
 * Pass the appropriate media type to fetch diff and patch formats.
 */
async function getPullRequestFunction(
  input: GetPullRequestInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/pulls/${input.pull_number}`;
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const res = await ofetch(url, {
      method: "GET",
      headers,
      parseResponse: (responseText) => responseText,
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to fetch pull request")
    );
  }
}

export const getPullRequest: ToolsetteTool = {
  name: "get_pull_request",
  description:
    "Get a pull request. Draft pull requests are available in public repositories with GitHub Free and GitHub Free for organizations, GitHub Pro, and legacy per-repository billing plans, and in public and private repositories with GitHub Team and GitHub Enterprise Cloud. Lists details of a pull request by providing its number. Pass the appropriate media type to fetch diff and patch formats.",
  parameters: getPullRequestSchema,
  function: getPullRequestFunction,
};