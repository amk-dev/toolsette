import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const lockIssueSchema = z.object({
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
  lock_reason: z
    .enum(["off-topic", "too heated", "resolved", "spam"])
    .optional()
    .describe(
      "The reason for locking the issue or pull request conversation. Lock will fail if you don't use one of these reasons: off-topic, too heated, resolved, spam. Example: off-topic"
    ),
});

type LockIssueInput = z.infer<typeof lockIssueSchema>;

async function lockIssueFunction(
  input: LockIssueInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/issues/${input.issue_number}/lock`;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    let body: string = "";

    // If a lock_reason is provided (and not null), include it in the JSON body,
    // otherwise set Content-Length header to zero.
    if (input.lock_reason != null) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify({ lock_reason: input.lock_reason });
    } else {
      headers["Content-Length"] = "0";
    }

    const res = await ofetch(url, {
      method: "PUT",
      body,
      headers,
      // As the API returns a 204 status with no content, we'll simply return the response text.
      parseResponse: (text: string) => text,
    });

    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to lock the issue"));
  }
}

export const lockIssue: ToolsetteTool = {
  name: "lock_issue",
  description:
    "Users with push access can lock an issue or pull request's conversation.\n\nNote that, if you choose not to pass any parameters, you'll need to set `Content-Length` to zero when calling out to this endpoint. For more information, see \"[HTTP method](https://docs.github.com/rest/guides/getting-started-with-the-rest-api#http-method)\".",
  parameters: lockIssueSchema,
  function: lockIssueFunction,
};