import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Schema for individual review comments
const reviewCommentSchema = z.object({
  path: z
    .string()
    .describe("The relative path to the file that necessitates a review comment."),
  position: z
    .number()
    .int()
    .optional()
    .describe(
      'The position in the diff where you want to add a review comment. Note this is not the same as the line number in the file. The position value equals the number of lines down from the first "@@" hunk header; the line just below the header is position 1, the next is 2, and so on.'
    ),
  body: z.string().describe("Text of the review comment."),
  line: z
    .number()
    .int()
    .optional()
    .describe("The line in the file. Example: 28"),
  side: z.string().optional().describe("Side, for example: RIGHT"),
  start_line: z
    .number()
    .int()
    .optional()
    .describe("The start line in the diff. Example: 26"),
  start_side: z.string().optional().describe("The start side. Example: LEFT"),
});

// Main input schema combining path parameters and optional request body parameters
const createReviewSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  pull_number: z
    .number()
    .int()
    .describe("The number that identifies the pull request."),
  commit_id: z
    .string()
    .optional()
    .describe(
      "The SHA of the commit that needs a review. Not using the latest commit SHA may render your review comment outdated if a subsequent commit modifies the line you specify as the `position`. Defaults to the most recent commit in the pull request when you do not specify a value."
    ),
  body: z
    .string()
    .optional()
    .describe(
      "**Required** when using `REQUEST_CHANGES` or `COMMENT` for the `event` parameter. The body text of the pull request review."
    ),
  event: z
    .enum(["APPROVE", "REQUEST_CHANGES", "COMMENT"])
    .optional()
    .describe(
      "The review action you want to perform. The review actions include: `APPROVE`, `REQUEST_CHANGES`, or `COMMENT`. By leaving this blank, the review action state will be set to `PENDING`, meaning you will need to submit the review later."
    ),
  comments: z
    .array(reviewCommentSchema)
    .optional()
    .describe("An array specifying the location, destination, and contents of draft review comments."),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;

// Implementation of the tool function
async function createPullRequestReviewFunction(
  input: CreateReviewInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Extract path parameters and request payload fields from the input
    const { owner, repo, pull_number, commit_id, body, event, comments } = input;

    // Build the request body payload; skip undefined values
    const payload: Record<string, unknown> = {};
    if (commit_id !== undefined) payload.commit_id = commit_id;
    if (body !== undefined) payload.body = body;
    if (event !== undefined) payload.event = event;
    if (comments !== undefined) payload.comments = comments;

    const url = `https://api.github.com/repos/${owner}/${repo}/pulls/${pull_number}/reviews`;

    const response = await ofetch(url, {
      method: "POST",
      headers: {
        // Set Accept header to get raw markdown response by default (custom media type)
        Accept: "application/vnd.github-commitcomment.raw+json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${metadata.auth.apiKey}`,
      },
      // Send the payload; if no review body parameters are provided an empty object is sent.
      body: payload,
      // Parse the response as text
      parseResponse: (text) => text,
    });

    return ok(response);
  } catch (error) {
    return err(
      error instanceof Error
        ? error
        : new Error("Failed to create review for pull request")
    );
  }
}

// Export the tool object for the Toolsette framework
export const create_pull_request_review: ToolsetteTool = {
  name: "create_pull_request_review",
  description:
    "Creates a review on a specified pull request. This endpoint triggers notifications and supports creating pending reviews with inline comments.",
  parameters: createReviewSchema,
  function: createPullRequestReviewFunction,
};