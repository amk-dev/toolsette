import { describe, it, expect } from "vitest";
import { createGist } from "./gists-create";

const createGistFunction = createGist.function;

const GITHUB_TOKEN = process.env.GITHUB_API_KEY;
if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is required to run tests");
}

describe("createGistFunction Integration Tests", () => {
  const auth = { type: "Bearer", apiKey: GITHUB_TOKEN };

  it("should successfully create a private gist with minimal parameters", async () => {
    const input = {
      files: {
        "test.txt": { content: "Hello, world!" },
      },
    };
    const result = await createGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot(`
      Ok {
        "value": "{"url":"https://api.github.com/gists/19b8e33c731af408724f524bb2809257","forks_url":"https://api.github.com/gists/19b8e33c731af408724f524bb2809257/forks","commits_url":"https://api.github.com/gists/19b8e33c731af408724f524bb2809257/commits","id":"19b8e33c731af408724f524bb2809257","node_id":"G_kwDOA3FSRdoAIDE5YjhlMzNjNzMxYWY0MDg3MjRmNTI0YmIyODA5MjU3","git_pull_url":"https://gist.github.com/19b8e33c731af408724f524bb2809257.git","git_push_url":"https://gist.github.com/19b8e33c731af408724f524bb2809257.git","html_url":"https://gist.github.com/amk-dev/19b8e33c731af408724f524bb2809257","files":{"test.txt":{"filename":"test.txt","type":"text/plain","language":"Text","raw_url":"https://gist.githubusercontent.com/amk-dev/19b8e33c731af408724f524bb2809257/raw/5dd01c177f5d7d1be5346a5bc18a569a7410c2ef/test.txt","size":13,"truncated":false,"content":"Hello, world!","encoding":"utf-8"}},"public":false,"created_at":"2025-02-04T13:39:48Z","updated_at":"2025-02-04T13:39:48Z","description":null,"comments":0,"user":null,"comments_enabled":true,"comments_url":"https://api.github.com/gists/19b8e33c731af408724f524bb2809257/comments","owner":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"forks":[],"history":[{"user":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"version":"9803658ac2202c9ee58691a4f4440f260ac45c24","committed_at":"2025-02-04T13:39:47Z","change_status":{"total":1,"additions":1,"deletions":0},"url":"https://api.github.com/gists/19b8e33c731af408724f524bb2809257/9803658ac2202c9ee58691a4f4440f260ac45c24"}],"truncated":false}",
      }
    `);
  });

  it("should successfully create a public gist with public as string 'true'", async () => {
    const input = {
      description: "Public gist created using string value",
      files: {
        "public.txt": { content: "This is a public gist" },
      },
      public: "true",
    };
    const result = await createGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot(`
      Ok {
        "value": "{"url":"https://api.github.com/gists/3fe8d5a447cb84d762c44ea7dd068948","forks_url":"https://api.github.com/gists/3fe8d5a447cb84d762c44ea7dd068948/forks","commits_url":"https://api.github.com/gists/3fe8d5a447cb84d762c44ea7dd068948/commits","id":"3fe8d5a447cb84d762c44ea7dd068948","node_id":"G_kwDOA3FSRdoAIDNmZThkNWE0NDdjYjg0ZDc2MmM0NGVhN2RkMDY4OTQ4","git_pull_url":"https://gist.github.com/3fe8d5a447cb84d762c44ea7dd068948.git","git_push_url":"https://gist.github.com/3fe8d5a447cb84d762c44ea7dd068948.git","html_url":"https://gist.github.com/amk-dev/3fe8d5a447cb84d762c44ea7dd068948","files":{"public.txt":{"filename":"public.txt","type":"text/plain","language":"Text","raw_url":"https://gist.githubusercontent.com/amk-dev/3fe8d5a447cb84d762c44ea7dd068948/raw/927226924e98a52b0495067ceced5f7028175012/public.txt","size":21,"truncated":false,"content":"This is a public gist","encoding":"utf-8"}},"public":true,"created_at":"2025-02-04T13:39:48Z","updated_at":"2025-02-04T13:39:49Z","description":"Public gist created using string value","comments":0,"user":null,"comments_enabled":true,"comments_url":"https://api.github.com/gists/3fe8d5a447cb84d762c44ea7dd068948/comments","owner":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"forks":[],"history":[{"user":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"version":"b312fbd6f7659f75017149a4d11a8788d3d90d34","committed_at":"2025-02-04T13:39:48Z","change_status":{"total":1,"additions":1,"deletions":0},"url":"https://api.github.com/gists/3fe8d5a447cb84d762c44ea7dd068948/b312fbd6f7659f75017149a4d11a8788d3d90d34"}],"truncated":false}",
      }
    `);
  });

  it("should successfully create a public gist with public as boolean true", async () => {
    const input = {
      description: "Public gist created using boolean value",
      files: {
        "public2.txt": { content: "This is another public gist" },
      },
      public: true,
    };
    const result = await createGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot(`
      Ok {
        "value": "{"url":"https://api.github.com/gists/b8e5589f2a7babce14fc89c3dfa997af","forks_url":"https://api.github.com/gists/b8e5589f2a7babce14fc89c3dfa997af/forks","commits_url":"https://api.github.com/gists/b8e5589f2a7babce14fc89c3dfa997af/commits","id":"b8e5589f2a7babce14fc89c3dfa997af","node_id":"G_kwDOA3FSRdoAIGI4ZTU1ODlmMmE3YmFiY2UxNGZjODljM2RmYTk5N2Fm","git_pull_url":"https://gist.github.com/b8e5589f2a7babce14fc89c3dfa997af.git","git_push_url":"https://gist.github.com/b8e5589f2a7babce14fc89c3dfa997af.git","html_url":"https://gist.github.com/amk-dev/b8e5589f2a7babce14fc89c3dfa997af","files":{"public2.txt":{"filename":"public2.txt","type":"text/plain","language":"Text","raw_url":"https://gist.githubusercontent.com/amk-dev/b8e5589f2a7babce14fc89c3dfa997af/raw/884af919b8e864401e10ad66f2de9db1197af7bf/public2.txt","size":27,"truncated":false,"content":"This is another public gist","encoding":"utf-8"}},"public":true,"created_at":"2025-02-04T13:39:49Z","updated_at":"2025-02-04T13:39:49Z","description":"Public gist created using boolean value","comments":0,"user":null,"comments_enabled":true,"comments_url":"https://api.github.com/gists/b8e5589f2a7babce14fc89c3dfa997af/comments","owner":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"forks":[],"history":[{"user":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"version":"6d0681c66ff7a48a941b6d01355c506d74fc3e81","committed_at":"2025-02-04T13:39:49Z","change_status":{"total":1,"additions":1,"deletions":0},"url":"https://api.github.com/gists/b8e5589f2a7babce14fc89c3dfa997af/6d0681c66ff7a48a941b6d01355c506d74fc3e81"}],"truncated":false}",
      }
    `);
  });

  it("should create a gist with multiple files", async () => {
    const input = {
      description: "Multi-file gist test",
      files: {
        "file1.txt": { content: "Content of file 1" },
        "file2.txt": { content: "Content of file 2" },
      },
    };
    const result = await createGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot(`
      Ok {
        "value": "{"url":"https://api.github.com/gists/c752e5395519e78ab35e9349c733ab1e","forks_url":"https://api.github.com/gists/c752e5395519e78ab35e9349c733ab1e/forks","commits_url":"https://api.github.com/gists/c752e5395519e78ab35e9349c733ab1e/commits","id":"c752e5395519e78ab35e9349c733ab1e","node_id":"G_kwDOA3FSRdoAIGM3NTJlNTM5NTUxOWU3OGFiMzVlOTM0OWM3MzNhYjFl","git_pull_url":"https://gist.github.com/c752e5395519e78ab35e9349c733ab1e.git","git_push_url":"https://gist.github.com/c752e5395519e78ab35e9349c733ab1e.git","html_url":"https://gist.github.com/amk-dev/c752e5395519e78ab35e9349c733ab1e","files":{"file1.txt":{"filename":"file1.txt","type":"text/plain","language":"Text","raw_url":"https://gist.githubusercontent.com/amk-dev/c752e5395519e78ab35e9349c733ab1e/raw/5728ca8d443090db34b0350fa64a723d35732aa6/file1.txt","size":17,"truncated":false,"content":"Content of file 1","encoding":"utf-8"},"file2.txt":{"filename":"file2.txt","type":"text/plain","language":"Text","raw_url":"https://gist.githubusercontent.com/amk-dev/c752e5395519e78ab35e9349c733ab1e/raw/b0df1fb85cbbf34cb3d97063c8ec1b360b98c832/file2.txt","size":17,"truncated":false,"content":"Content of file 2","encoding":"utf-8"}},"public":false,"created_at":"2025-02-04T13:39:50Z","updated_at":"2025-02-04T13:39:50Z","description":"Multi-file gist test","comments":0,"user":null,"comments_enabled":true,"comments_url":"https://api.github.com/gists/c752e5395519e78ab35e9349c733ab1e/comments","owner":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"forks":[],"history":[{"user":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"version":"c1c1dd758eab36e241dbdb2a13fe1ea70ac702b5","committed_at":"2025-02-04T13:39:50Z","change_status":{"total":2,"additions":2,"deletions":0},"url":"https://api.github.com/gists/c752e5395519e78ab35e9349c733ab1e/c1c1dd758eab36e241dbdb2a13fe1ea70ac702b5"}],"truncated":false}",
      }
    `);
  });

  it("should handle error with an invalid auth token", async () => {
    const input = {
      files: {
        "invalid.txt": { content: "This should not be created" },
      },
    };
    const invalidAuth = { type: "Bearer", apiKey: "invalid-token" };
    const result = await createGistFunction(input, { auth: invalidAuth });
    expect(result).toMatchInlineSnapshot(`
      Err {
        "error": [FetchError: [POST] "https://api.github.com/gists": 401 Unauthorized],
      }
    `);
  });

  it("should handle error when files field is empty", async () => {
    const input = {
      description: "Empty files test",
      files: {},
    };
    const result = await createGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot(`
      Err {
        "error": [FetchError: [POST] "https://api.github.com/gists": 422 Unprocessable Entity],
      }
    `);
  });

  it("should successfully create a gist with a very long description", async () => {
    const longDescription = "Long description ".repeat(20);
    const input = {
      description: longDescription,
      files: {
        "long.txt": { content: "Content for gist with a long description" },
      },
    };
    const result = await createGistFunction(input, { auth });
    expect(result).toMatchInlineSnapshot(`
      Ok {
        "value": "{"url":"https://api.github.com/gists/d7b7cc7785f07f111f092bd3085c326d","forks_url":"https://api.github.com/gists/d7b7cc7785f07f111f092bd3085c326d/forks","commits_url":"https://api.github.com/gists/d7b7cc7785f07f111f092bd3085c326d/commits","id":"d7b7cc7785f07f111f092bd3085c326d","node_id":"G_kwDOA3FSRdoAIGQ3YjdjYzc3ODVmMDdmMTExZjA5MmJkMzA4NWMzMjZk","git_pull_url":"https://gist.github.com/d7b7cc7785f07f111f092bd3085c326d.git","git_push_url":"https://gist.github.com/d7b7cc7785f07f111f092bd3085c326d.git","html_url":"https://gist.github.com/amk-dev/d7b7cc7785f07f111f092bd3085c326d","files":{"long.txt":{"filename":"long.txt","type":"text/plain","language":"Text","raw_url":"https://gist.githubusercontent.com/amk-dev/d7b7cc7785f07f111f092bd3085c326d/raw/b45b4989b8e2633d7a039aa9fd5db84b92b8fa5d/long.txt","size":40,"truncated":false,"content":"Content for gist with a long description","encoding":"utf-8"}},"public":false,"created_at":"2025-02-04T13:39:52Z","updated_at":"2025-02-04T13:39:52Z","description":"Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description Long description ","comments":0,"user":null,"comments_enabled":true,"comments_url":"https://api.github.com/gists/d7b7cc7785f07f111f092bd3085c326d/comments","owner":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"forks":[],"history":[{"user":{"login":"amk-dev","id":57758277,"node_id":"MDQ6VXNlcjU3NzU4Mjc3","avatar_url":"https://avatars.githubusercontent.com/u/57758277?v=4","gravatar_id":"","url":"https://api.github.com/users/amk-dev","html_url":"https://github.com/amk-dev","followers_url":"https://api.github.com/users/amk-dev/followers","following_url":"https://api.github.com/users/amk-dev/following{/other_user}","gists_url":"https://api.github.com/users/amk-dev/gists{/gist_id}","starred_url":"https://api.github.com/users/amk-dev/starred{/owner}{/repo}","subscriptions_url":"https://api.github.com/users/amk-dev/subscriptions","organizations_url":"https://api.github.com/users/amk-dev/orgs","repos_url":"https://api.github.com/users/amk-dev/repos","events_url":"https://api.github.com/users/amk-dev/events{/privacy}","received_events_url":"https://api.github.com/users/amk-dev/received_events","type":"User","user_view_type":"public","site_admin":false},"version":"8fe9218b8307e9f539fb7f9b99353c1485faae17","committed_at":"2025-02-04T13:39:52Z","change_status":{"total":1,"additions":1,"deletions":0},"url":"https://api.github.com/gists/d7b7cc7785f07f111f092bd3085c326d/8fe9218b8307e9f539fb7f9b99353c1485faae17"}],"truncated":false}",
      }
    `);
  });
});
