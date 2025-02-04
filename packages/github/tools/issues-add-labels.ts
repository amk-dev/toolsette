import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// --- Request Body Schemas ---

// Alternative 1: An object with a "labels" key whose value is an array of strings.
const labelStringListObjectSchema = z
  .object({
    labels: z
      .array(z.string())
      .min(1, "Must have at least 1 label")
      .describe(
        "The names of the labels to add to the issue's existing labels. You can pass an empty array to remove all labels. Alternatively, you can pass a single label as a string or an array of labels directly, but GitHub recommends passing an object with the labels key."
      ),
  })
  .describe("Object with a labels key that is an array of strings");

// Alternative 2: An array of strings.
const labelStringArraySchema = z
  .array(z.string())
  .min(1, "Must have at least 1 label")
  .describe("An array of strings representing label names");

// Alternative 3: An object with a "labels" key whose value is an array of objects (each with a name property).
const labelObjectListObjectSchema = z
  .object({
    labels: z
      .array(
        z
          .object({
            name: z.string().describe("The name of the label."),
          })
          .describe("Label object")
      )
      .min(1, "Must have at least 1 label"),
  })
  .describe("Object with a labels key that is an array of label objects");

// Alternative 4: An array of objects (each with a name property).
const labelObjectArraySchema = z
  .array(
    z.object({
      name: z.string().describe("The name of the label."),
    })
  )
  .min(1, "Must have at least 1 label")
  .describe("An array of label objects");

// Alternative 5: A single label given as a string.
const labelStringSchema = z.string().describe("A single label as a string");

// Union of all request body alternatives.
const requestBodySchema = z
  .union([
    labelStringListObjectSchema,
    labelStringArraySchema,
    labelObjectListObjectSchema,
    labelObjectArraySchema,
    labelStringSchema,
  ])
  .describe("Request body for adding labels to an issue");

// --- Combined Input Schema ---

const addLabelsInputSchema = z.object({
  // Path parameter: owner of repository.
  owner: z
    .string()
    .describe(
      "The account owner of the repository. The name is not case sensitive."
    ),
  // Path parameter: repository name.
  repo: z
    .string()
    .describe(
      "The name of the repository without the `.git` extension. The name is not case sensitive."
    ),
  // Path parameter: the issue number.
  issue_number: z
    .number()
    .int()
    .describe("The number that identifies the issue."),
  // Request body is optional.
  body: requestBodySchema.optional(),
});

export type AddLabelsInput = z.infer<typeof addLabelsInputSchema>;

// --- Tool Implementation Function ---

async function addLabelsFunction(
  input: AddLabelsInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Construct the endpoint URL using the provided path parameters.
    const url = `https://api.github.com/repos/${encodeURIComponent(
      input.owner
    )}/${encodeURIComponent(input.repo)}/issues/${input.issue_number}/labels`;

    // Prepare the request headers.
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    // Prepare the request body if provided.
    // Note: The GitHub API accepts multiple formats; we pass the input.body as is.
    const body = input.body !== undefined ? JSON.stringify(input.body) : undefined;

    // Send the HTTP POST request using ofetch.
    const res = await ofetch(url, {
      method: "POST",
      headers,
      body,
      // We choose a simple parse that returns the raw response text.
      parseResponse: (responseText) => responseText,
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error
        ? error
        : new Error("Failed to add labels to the issue")
    );
  }
}

// --- Export the Tool Object ---

export const addLabelsToIssue: ToolsetteTool = {
  name: "add_labels_to_issue",
  description:
    "Adds labels to an issue. If you provide an empty array of labels, all labels are removed from the issue.",
  parameters: addLabelsInputSchema,
  function: addLabelsFunction,
};