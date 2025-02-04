import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// This schema combines all input parameters from the path and the JSON request body.
const updateIssueCommentSchema = z.object({
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive."),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  comment_id: z.number().int().describe("The unique identifier of the comment."),
  body: z.string().describe("The contents of the comment. Example: 'Me too'")
});

type UpdateIssueCommentInput = z.infer<typeof updateIssueCommentSchema>;

async function updateIssueCommentFunction(
  input: UpdateIssueCommentInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Construct the URL using the path parameters.
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/comments/${input.comment_id}`;
    
    // Set up default headers. Using the GitHub media type that returns raw markdown by default.
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.raw+json"
    };

    // Handle authentication using the provided API key from metadata.
    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    // Send the PATCH request with the comment body in the JSON payload.
    const res = await ofetch(url, {
      method: "PATCH",
      headers,
      body: { body: input.body },
      parseResponse: (txt) => txt,
    });

    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to update issue comment"));
  }
}

export const updateIssueComment: ToolsetteTool = {
  name: "update_issue_comment",
  description:
    "Update an issue comment: You can use the REST API to update comments on issues and pull requests. " +
    "Every pull request is an issue, but not every issue is a pull request. This endpoint supports custom media types " +
    "that return raw, text, HTML, or full representations of the comment.",
  parameters: updateIssueCommentSchema,
  function: updateIssueCommentFunction,
};