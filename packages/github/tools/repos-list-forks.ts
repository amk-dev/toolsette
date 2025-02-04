import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const listForksSchema = z.object({
  owner: z
    .string()
    .describe("The account owner of the repository. The name is not case sensitive."),
  repo: z
    .string()
    .describe(
      "The name of the repository without the `.git` extension. The name is not case sensitive."
    ),
  sort: z
    .enum(["newest", "oldest", "stargazers", "watchers"])
    .optional()
    .default("newest")
    .describe("The sort order. `stargazers` will sort by star count."),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .default(30)
    .describe(
      'The number of results per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."'
    ),
  page: z
    .number()
    .int()
    .positive()
    .optional()
    .default(1)
    .describe(
      'The page number of the results to fetch. For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."'
    ),
});

type ListForksInput = z.infer<typeof listForksSchema>;

async function listForksFunction(
  input: ListForksInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const url = `https://api.github.com/repos/${input.owner}/${input.repo}/forks`;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const query = {
      sort: input.sort,
      per_page: input.per_page,
      page: input.page,
    };

    const response = await ofetch(url, {
      method: "GET",
      headers,
      query,
      // Return the raw text response as in the example implementation.
      parseResponse: (text: string) => text,
    });

    return ok(response);
  } catch (error) {
    return err(error instanceof Error ? error : new Error("Failed to list forks"));
  }
}

export const listForks: ToolsetteTool = {
  name: "list_forks",
  description: "List forks",
  parameters: listForksSchema,
  function: listForksFunction,
};