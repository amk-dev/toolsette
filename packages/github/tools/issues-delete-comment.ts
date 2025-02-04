import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const deleteCommentSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  comment_id: z
    .number()
    .int()
    .describe("The unique identifier of the comment."),
});

type DeleteCommentInput = z.infer<typeof deleteCommentSchema>;

async function deleteCommentFunction(
  input: DeleteCommentInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/comments/${input.comment_id}`;

    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    await ofetch(url, {
      method: "DELETE",
      headers,
      // Since DELETE returns a 204 No Content, we parse the response as text
      parseResponse: (txt: string) => txt,
    });

    return ok("Comment deleted successfully");
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to delete comment"));
  }
}

export const deleteIssueComment: ToolsetteTool = {
  name: "delete_issue_comment",
  description:
    "You can use the REST API to delete comments on issues and pull requests. Every pull request is an issue, but not every issue is a pull request.",
  parameters: deleteCommentSchema,
  function: deleteCommentFunction,
};