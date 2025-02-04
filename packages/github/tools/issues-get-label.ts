import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

// Define the input parameter schema
const getLabelSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe("The name of the repository without the `.git` extension. The name is not case sensitive."),
  name: z
    .string()
    .describe("The name of the label.")
});

type GetLabelInput = z.infer<typeof getLabelSchema>;

/**
 * Gets a label using the given name.
 *
 * @param input - Input parameters including owner, repo, and name of the label
 * @param metadata - Contains authentication information, e.g. Bearer token in metadata.auth.apiKey
 * @returns The label response as a string wrapped in a Result, or an error.
 */
async function getLabelFunction(
  input: GetLabelInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/labels/${input.name}`;

    const headers: Record<string, string> = {
      "Accept": "application/vnd.github.v3+json"
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const res = await ofetch(url, {
      method: "GET",
      headers,
      parseResponse: (text) => text
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to fetch label")
    );
  }
}

export const getLabel: ToolsetteTool = {
  name: "get_label",
  description: "Gets a label using the given name.",
  parameters: getLabelSchema,
  function: getLabelFunction,
};