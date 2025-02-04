import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Input parameters schema for the GET a repository endpoint
const getRepositorySchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive.")
});

type GetRepositoryInput = z.infer<typeof getRepositorySchema>;

async function getRepositoryFunction(
  input: GetRepositoryInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<any, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}`;
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json"
    };

    // Handle authentication using the provided API key
    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const res = await ofetch(url, {
      method: "GET",
      headers,
      // Parse the API response as JSON
      parseResponse: (text) => JSON.parse(text)
    });

    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to get repository"));
  }
}

export const getRepository: ToolsetteTool = {
  name: "get_repository",
  description:
    "Get a repository. The `parent` and `source` objects are present when the repository is a fork. `parent` is the repository this repository was forked from, `source` is the ultimate source for the network. In order to see the `security_and_analysis` block for a repository you must have admin permissions for the repository or be an owner or security manager for the organization that owns the repository.",
  parameters: getRepositorySchema,
  function: getRepositoryFunction,
};