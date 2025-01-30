## Installation

```sh
# install toolsette core
npm install @toolsette/core

# install the github tools package
npm install @toolsette/github
```

## Supported Tools

Initially, the following tools are supported, i plan on supporting most endpoints very soon. if you want any specific endpoint to be supported, please open an issue. we will prioritize it based on the number of requests.

| Operation ID                  | Tag          | Method          |
| ----------------------------- | ------------ | --------------- |
| gists/list                    | Gists        | listGists       |
| gists/create                  | Gists        | createGist      |
| gists/get                     | Gists        | getGist         |
| gists/update                  | Gists        | updateGist      |
| gists/delete                  | Gists        | deleteGist      |
| issues/list                   | Issues       | listIssues      |
| repos/create-in-org           | Repositories | createRepo      |
| repos/get                     | Repositories | getRepo         |
| repos/update                  | Repositories | updateRepo      |
| repos/delete                  | Repositories | deleteRepo      |
| repos/create-in-org           | Repositories | createRepo      |
| repos/get-content             | Repositories | getContent      |
| repos/list-forks              | Repositories | listForks       |
| repos/create-fork             | Repositories | createFork      |
| issues/create                 | Issues       | createIssue     |
| issues/list-comments-for-repo | Issues       | listComments    |
| issues/get-comment            | Issues       | getComment      |
| issues/update-comment         | Issues       | updateComment   |
| issues/delete-comment         | Issues       | deleteComment   |
| issues/get                    | Issues       | getIssue        |
| issues/update                 | Issues       | updateIssue     |
| issues/add-assignees          | Issues       | addAssignees    |
| issues/remove-assignees       | Issues       | removeAssignees |
| issues/list-comments          | Issues       | listComments    |
| issues/create-comment         | Issues       | createComment   |
| issues/list-labels-on-issue   | Issues       | listLabels      |
| issues/add-labels             | Issues       | addLabels       |
| issues/remove-label           | Issues       | removeLabel     |
| issues/lock                   | Issues       | lockIssue       |
| issues/unlock                 | Issues       | unlockIssue     |
| issues/create-label           | Issues       | createLabel     |
| issues/get-label              | Issues       | getLabel        |
| issues/update-label           | Issues       | updateLabel     |
| issues/delete-label           | Issues       | deleteLabel     |
| pulls/list                    | Pulls        | listPulls       |
| pulls/get                     | Pulls        | getPull         |
| pulls/create-review           | Pulls        | createReview    |
