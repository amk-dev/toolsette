import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

/**
 * Schema for creating a fork.
 * 
 * Parameters:
 * - owner (required): The account owner of the repository. The name is not case sensitive.
 * - repo (required): The name of the repository without the `.git` extension. The name is not case sensitive.
 *
 * Request body (all optional):
 * - organization: Optional parameter to specify the organization name if forking into an organization.
 * - name: When forking from an existing repository, a new name for the fork.
 * - default_branch_only: When forking from an existing repository, fork with only the default branch.
 */
const createForkSchema = z.object({
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive."),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  organization: z.string().optional().describe("Optional parameter to specify the organization name if forking into an organization."),
  name: z.string().optional().describe("When forking from an existing repository, a new name for the fork."),
  default_branch_only: z.boolean().optional().describe("When forking from an existing repository, fork with only the default branch."),
});

type CreateForkInput = z.infer<typeof createForkSchema>;

async function createForkFunction(
  input: CreateForkInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<any, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/forks`;

    // Build the request body only if at least one property is provided.
    const requestBody: { organization?: string; name?: string; default_branch_only?: boolean } = {};
    if (input.organization !== undefined) requestBody.organization = input.organization;
    if (input.name !== undefined) requestBody.name = input.name;
    if (input.default_branch_only !== undefined) requestBody.default_branch_only = input.default_branch_only;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    const options: Record<string, any> = {
      method: "POST",
      headers,
      // Only include body if there is at least one field
      ...(Object.keys(requestBody).length > 0 && { body: requestBody }),
      // Ensure that ofetch returns the response as parsed JSON.
      parseResponse: (data: string) => JSON.parse(data),
    };

    const res = await ofetch(url, options);
    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to create fork"));
  }
}

export const createFork: ToolsetteTool = {
  name: "create_fork",
  description:
    "Create a fork for the authenticated user.\n\n> NOTE\n> Forking a repository happens asynchronously. You may have to wait a short period of time before you can access the git objects. If this takes longer than 5 minutes, be sure to contact GitHub Support.\n\n> NOTE\n> Although this endpoint works with GitHub Apps, the GitHub App must be installed on the destination account with access to all repositories and on the source account with access to the source repository.",
  parameters: createForkSchema,
  function: createForkFunction,
};