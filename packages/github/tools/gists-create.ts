import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import type { ToolsetteTool } from "@toolsette/utils";

// Schema for creating a gist based on the OpenAPI specification
const createGistSchema = z.object({
  description: z
    .string()
    .optional()
    .describe("Description of the gist (e.g. 'Example Ruby script')"),
  files: z
    .record(
      z.object({
        content: z.string().describe("Content of the file"),
      })
    )
    .describe(
      "Names and content for the files that make up the gist. Example: { 'hello.rb': { content: 'puts \"Hello, World!\"' } }"
    ),
  public: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .optional()
    .default(false)
    .describe(
      "Flag indicating whether the gist is public. Can be boolean or a string ('true' or 'false')."
    ),
});

type CreateGistInput = z.infer<typeof createGistSchema>;

// Function to create a gist using GitHub's API
async function createGistFunction(
  input: CreateGistInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
      Authorization: `Bearer ${metadata.auth.apiKey}`,
    };

    const response = await ofetch("https://api.github.com/gists", {
      method: "POST",
      body: input,
      headers,
      // Return the raw response text
      parseResponse: (text) => text,
    });

    return ok(response);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to create gist")
    );
  }
}

// Exporting the tool object according to the Toolsette framework guidelines
export const createGist: ToolsetteTool = {
  name: "create_gist",
  description:
    'Allows you to add a new gist with one or more files.\n\n> [!NOTE]\n> Don\'t name your files "gistfile" with a numerical suffix. This is the format of the automatic naming scheme that Gist uses internally.',
  parameters: createGistSchema,
  function: createGistFunction,
};
