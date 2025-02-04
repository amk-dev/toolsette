import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Define the input schema for the "Get an issue comment" endpoint.
const getIssueCommentSchema = z.object({
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive."),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  comment_id: z.number().int().describe("The unique identifier of the comment."),
});

type GetIssueCommentInput = z.infer<typeof getIssueCommentSchema>;

/**
 * This function calls the GitHub API to get an issue comment.
 *
 * It uses the provided owner, repo, and comment_id to build the path URL.
 * Authentication is handled via the metadata.auth.apiKey, which is attached as a Bearer token.
 *
 * @param input - An object containing the owner, repo, and comment_id.
 * @param metadata - Contains authentication details.
 * @returns A Result wrapping a string response on success, or an Error on failure.
 */
async function getIssueCommentFunction(
  input: GetIssueCommentInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/comments/${input.comment_id}`;

    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    // Using ofetch to perform the GET request.
    // parseResponse is set to return text for simplicity.
    const res: string = await ofetch(url, {
      method: "GET",
      headers,
      parseResponse: (txt) => txt,
    });

    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to fetch issue comment"));
  }
}

export const getIssueComment: ToolsetteTool = {
  name: "get_issue_comment",
  description:
    "Get an issue comment. You can use the REST API to get comments on issues and pull requests. "
    + "Every pull request is an issue, but not every issue is a pull request. "
    + "This endpoint supports custom media types to return raw, text, or HTML representations of the comment body.",
  parameters: getIssueCommentSchema,
  function: getIssueCommentFunction,
};