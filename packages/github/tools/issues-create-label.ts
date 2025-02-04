import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

//
// Create a zod schema that combines all input parameters
// Both the path parameters (owner, repo) and the request body parameters (name, color, description)
//
const createLabelSchema = z.object({
  // Path parameters
  owner: z.string().describe("The account owner of the repository. The name is not case sensitive."),
  repo: z.string().describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  // Request body parameters
  name: z.string().describe(
    "The name of the label. Emoji can be added to label names, using either native emoji or colon-style markup. For example, typing `:strawberry:` will render the emoji. For a full list of available emoji and codes, see 'Emoji cheat sheet'."
  ),
  // Although the OpenAPI description says the color parameter is required, the schema in the requestBody lists only 'name' as required.
  // Here we make color required because the operation description notes that both name and color are required.
  color: z
    .string()
    .regex(/^[0-9A-Fa-f]{6}$/, "Invalid hexadecimal color code")
    .describe("The hexadecimal color code for the label, without the leading `#`."),
  description: z
    .string()
    .max(100, "Must be 100 characters or fewer")
    .optional()
    .describe("A short description of the label. Must be 100 characters or fewer."),
});

type CreateLabelInput = z.infer<typeof createLabelSchema>;

//
// The tool function that calls GitHub's API to create a label
//
async function createLabelFunction(
  input: CreateLabelInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    // Construct the URL by interpolating the path parameters (owner and repo)
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/labels`;

    // Build the request body using the provided input.
    // Include the optional 'description' only if it is provided.
    const bodyData: { name: string; color: string; description?: string } = {
      name: input.name,
      color: input.color,
    };
    if (input.description !== undefined) {
      bodyData.description = input.description;
    }

    // Setup headers: authenticate with a Bearer token and specify Accept header.
    const headers = {
      Authorization: `Bearer ${metadata.auth.apiKey}`,
      Accept: "application/vnd.github+json",
    };

    // Make a POST request to create the label.
    // The parseResponse option is set to return the raw response text.
    const res = await ofetch(url, {
      method: "POST",
      body: bodyData,
      headers,
      parseResponse: (responseText: string) => responseText,
    });

    return ok(res);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to create label"));
  }
}

//
// Export the tool object with the required properties
//
export const createLabel: ToolsetteTool = {
  name: "create_label",
  description: "Creates a label for the specified repository with the given name and color.",
  parameters: createLabelSchema,
  function: createLabelFunction,
};