import { expect, test } from "vitest";
import { generateText } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

import { listGists } from "./listGists";
import { format, withAuth } from "@toolsette/utils";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const model = anthropic("claude-3-5-sonnet-latest");

const toolsWithAuth = withAuth([listGists], {
  type: "Bearer",
  apiKey: process.env.GITHUB_API_KEY!,
});

const listGistsAISdk = format(toolsWithAuth, "ai-sdk");

test("Show me all my gists from the last 24 hours", async () => {
  const res = await generateText({
    model,
    prompt: `right now the time is Thu 30 Jan, 9:37 PM, show me all my gists from the last 24 hours`,
    tools: listGistsAISdk,
  });

  expect(
    res.toolCalls.map((call) => ({
      args: call.args,
      toolName: call.toolName,
      type: call.type,
    }))
  ).toMatchInlineSnapshot(`
    [
      {
        "args": {
          "page": 1,
          "per_page": 30,
          "since": "2024-01-29T21:37:00Z",
        },
        "toolName": "list_gists",
        "type": "tool-call",
      },
    ]
  `);
});

test("get me the first 50 gists", async () => {
  const res = await generateText({
    model,
    prompt: `get me my first 50 gists`,
    tools: listGistsAISdk,
  });

  expect(
    res.toolCalls.map((call) => ({
      args: call.args,
      toolName: call.toolName,
      type: call.type,
    }))
  ).toMatchInlineSnapshot(`
    [
      {
        "args": {
          "page": 1,
          "per_page": 50,
        },
        "toolName": "list_gists",
        "type": "tool-call",
      },
    ]
  `);
});

test("Show me the third page of my gists, 20 gists per page", async () => {
  const res = await generateText({
    model,
    prompt: `show me the third page of my gists, 20 gists per page`,
    tools: listGistsAISdk,
  });

  expect(
    res.toolCalls.map((call) => ({
      args: call.args,
      toolName: call.toolName,
      type: call.type,
    }))
  ).toMatchInlineSnapshot(`
    [
      {
        "args": {
          "page": 3,
          "per_page": 20,
        },
        "toolName": "list_gists",
        "type": "tool-call",
      },
    ]
  `);
});

test("Get me the maximum number of gists possible in one request", async () => {
  const res = await generateText({
    model,
    prompt: `get me the maximum number of gists possible in one request`,
    tools: listGistsAISdk,
  });

  expect(
    res.toolCalls.map((call) => ({
      args: call.args,
      toolName: call.toolName,
      type: call.type,
    }))
  ).toMatchInlineSnapshot(`
    [
      {
        "args": {
          "page": 1,
          "per_page": 100,
        },
        "toolName": "list_gists",
        "type": "tool-call",
      },
    ]
  `);
});

// TODO: add more complex evals
// some observations on writing evals for listGists:
// I want to mock the output of the listGists and makes sure the pagination happens properly.
// I want to execute the listGist tool with a mock response and see if the model properly works with the output.
// If i'm extending vitest to have ai features, these would be good scenarios to consider.
