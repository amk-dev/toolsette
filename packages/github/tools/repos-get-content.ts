import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Input schema for the "Get repository content" endpoint.
// Parameters:
// • owner (required string): The account owner of the repository. The name is not case sensitive.
// • repo (required string): The name of the repository without the `.git` extension. The name is not case sensitive.
// • path (required string): Specifies the file path or directory in the repository. Supports multi‐segment paths.
// • ref (optional string): The name of the commit/branch/tag. Defaults to the repository’s default branch.
const getRepositoryContentSchema = z.object({
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive."),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  path: z.string().describe("Specifies the file path or directory in the repository. Supports multi-segment paths."),
  ref: z.string().optional().describe("The name of the commit/branch/tag. Default: the repository’s default branch."),
});

type GetRepositoryContentInput = z.infer<typeof getRepositoryContentSchema>;

// The tool function that calls the GitHub API for repository content.
// It handles authentication via metadata, constructs the URL from path parameters,
// adds an optional query parameter if provided, and returns the raw response as a string.
async function getRepositoryContentFunction(
  input: GetRepositoryContentInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Encode each segment of the path to preserve any multi-segment structure.
    const encodedPath = input.path.split('/').map(encodeURIComponent).join('/');
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/contents/${encodedPath}`;
    
    // Build query: include "ref" only if provided.
    const query: { ref?: string } = {};
    if (input.ref) {
      query.ref = input.ref;
    }
    
    // Set up headers with the custom media type and Bearer token for authentication.
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.object+json",
    };
    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }
    
    // Make the API call using ofetch. The response is returned as a text string.
    const response = await ofetch(url, {
      method: "GET",
      query,
      headers,
      parseResponse: (text) => text,
    });
    
    return ok(response);
  } catch (error) {
    return err(
      error instanceof Error
        ? error
        : new Error("Failed to get repository content")
    );
  }
}

// Export the tool object. The object name is in camelCase,
// and the "name" property uses snake_case as per the guidelines.
export const getRepositoryContent: ToolsetteTool = {
  name: "get_repository_content",
  description:
    "Gets the contents of a file or directory in a repository. Specify the file path or directory with the `path` parameter. If you omit the `path` parameter, you will receive the contents of the repository's root directory. This endpoint supports custom media types: application/vnd.github.raw+json, application/vnd.github.html+json, and application/vnd.github.object+json.",
  parameters: getRepositoryContentSchema,
  function: getRepositoryContentFunction,
};