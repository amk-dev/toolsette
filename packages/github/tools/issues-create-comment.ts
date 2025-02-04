import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const createIssueCommentSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  issue_number: z
    .number()
    .int()
    .describe("The number that identifies the issue."),
  body: z
    .string()
    .describe("The contents of the comment. Example: 'Me too'")
});

type CreateIssueCommentInput = z.infer<typeof createIssueCommentSchema>;

async function createIssueCommentFunction(
  input: CreateIssueCommentInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/${input.issue_number}/comments`;
    
    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json",
      "Content-Type": "application/json"
    };
    
    if (metadata.auth.apiKey) {
      headers.Authorization = `Bearer ${metadata.auth.apiKey}`;
    }
    
    const response = await ofetch(url, {
      method: "POST",
      headers,
      body: { body: input.body },
      // We use a simple parser to return the raw response text.
      parseResponse: (text: string) => text
    });
    
    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to create issue comment"));
  }
}

export const createIssueComment: ToolsetteTool = {
  name: "create_issue_comment",
  description:
    "Create an issue comment. You can use the REST API to create comments on issues and pull requests. Every pull request is an issue, but not every issue is a pull request. This endpoint triggers notifications and creating content too quickly may result in secondary rate limiting. It supports multiple custom media types: application/vnd.github.raw+json (default), application/vnd.github.text+json, application/vnd.github.html+json, and application/vnd.github.full+json.",
  parameters: createIssueCommentSchema,
  function: createIssueCommentFunction,
};