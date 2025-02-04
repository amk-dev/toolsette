import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const unlockIssueSchema = z.object({
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
  issue_number: z
    .number()
    .describe("The number that identifies the issue."),
});

type UnlockIssueInput = z.infer<typeof unlockIssueSchema>;

async function unlockIssueFunction(
  input: UnlockIssueInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const { owner, repo, issue_number } = input;
    const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issue_number}/lock`;

    const headers = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    await ofetch(url, {
      method: "DELETE",
      headers,
      parseResponse: (text: string) => text,
    });

    return ok("Issue unlocked successfully");
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to unlock issue")
    );
  }
}

export const unlockIssue: ToolsetteTool = {
  name: "unlock_issue",
  description: "Users with push access can unlock an issue's conversation.",
  parameters: unlockIssueSchema,
  function: unlockIssueFunction,
};