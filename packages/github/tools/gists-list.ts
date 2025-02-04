import { z } from "zod";
import { ofetch } from "ofetch";
import { Result, ok, err } from "neverthrow";
import { ToolsetteTool } from "@toolsette/utils";

const listGistsSchema = z.object({
  since: z
    .string()
    .datetime()
    .optional()
    .describe(
      "Only show results that were last updated after the given time. This is a timestamp in ISO 8601 format: `YYYY-MM-DDTHH:MM:SSZ`."
    ),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(100)
    .default(30)
    .describe(
      'The number of results per page (max 100). For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."'
    ),
  page: z
    .number()
    .int()
    .positive()
    .default(1)
    .describe(
      'The page number of the results to fetch. For more information, see "[Using pagination in the REST API](https://docs.github.com/rest/using-the-rest-api/using-pagination-in-the-rest-api)."'
    ),
});

type ListGistsInput = z.infer<typeof listGistsSchema>;

export async function listGistsFunction(
  input: ListGistsInput,
  metadata: { auth: { type: "Bearer"; apiKey: string } }
): Promise<Result<string, Error>> {
  try {
    const query: Record<string, unknown> = {
      per_page: input.per_page,
      page: input.page,
    };

    if (input.since) {
      query["since"] = input.since;
    }

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };

    if (metadata.auth.apiKey) {
      headers["Authorization"] = `Bearer ${metadata.auth.apiKey}`;
    }

    const res = await ofetch("https://api.github.com/gists", {
      method: "GET",
      query,
      headers,
      parseResponse: (txt: string) => txt,
    });

    return ok(res);
  } catch (error) {
    return err(
      error instanceof Error ? error : new Error("Failed to fetch gists")
    );
  }
}

export const listGists: ToolsetteTool = {
  name: "list_gists",
  description:
    "Lists the authenticated user's gists or if called anonymously, this endpoint returns all public gists",
  parameters: listGistsSchema,
  function: listGistsFunction,
};
