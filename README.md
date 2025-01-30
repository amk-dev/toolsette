This project is work in progress.

## Motivation

Imagine the combined effort wasted by multiple projects building agentic tools on converting existing apis and other interfaces into tools that are compatible with LLMs.

This Repo is an effort to build a collection of tools that anyone can use with their LLMs. think `DefinitelyTyped` for LLMs or `lodash` for LLMs.

I'm starting with github. right now i'm manually working with the github openapi spec with help from claude. i'm doing this to build an intuition for the process, so i can build a reliable automated tool later.

## POC API

```typescript
import { listGists } from "@toolsette/github";
import { withAuth, format } from "@toolsette/utils";
// don't forget to import the ai sdk stuff, skipping for this example

// add auth information to the tools
// right now the only supported auth type is Bearer, but we can easily extend this to support any other auth type (eg: Basic, OAuth, etc)
const toolsWithAuth = withAuth([listGists], {
  type: "Bearer",
  apiKey: process.env.GITHUB_API_KEY!,
});

// convert the toolsette definition to a format that can be used by vercel's ai sdk
// right now the only supported framework is vercel's ai sdk, but this can be easily extended to support any other framework by updating the format function
const listGistsAISdk = format(toolsWithAuth, "ai-sdk");

// just plug the tools into the framework of your choice ( and you're done! )
const res = await generateText({
  model,
  prompt: `show me all my gists from the last 24 hours`,
  tools: listGistsAISdk,
});
```

for each tool, i'm expecting to have,

- a typescript file that defines the tool and the associated zod schemas
- an eval file that has evals for this tool, written with vitest

> check the `tools/github` folder for the current poc implementation
