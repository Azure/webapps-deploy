# Octokit Webhooks

> machine-readable, always up-to-date GitHub Webhooks specifications

![Update status](https://github.com/octokit/webhooks/workflows/Update/badge.svg)

## Download

Download the latest specification at
[octokit.github.io/webhooks/index.json](https://octokit.github.io/webhooks/index.json)

## Example

Example webhook definition

```json
{
  "name": "issues",
  "actions": [
    "opened",
    "edited",
    "deleted",
    "transferred",
    "closed",
    "reopened",
    "assigned",
    "unassigned",
    "labeled",
    "unlabeled",
    "milestoned",
    "demilestoned"
  ],
  "examples": [
    {
      "action": "edited",
      "issue": {
        "url": "https://api.github.com/repos/Codertocat/Hello-World/issues/2",
        "repository_url": "https://api.github.com/repos/Codertocat/Hello-World",
        "labels_url": "https://api.github.com/repos/Codertocat/Hello-World/issues/2/labels{/name}",
        "comments_url": "https://api.github.com/repos/Codertocat/Hello-World/issues/2/comments",
        "events_url": "https://api.github.com/repos/Codertocat/Hello-World/issues/2/events",
        "html_url": "https://github.com/Codertocat/Hello-World/issues/2",
        "id": 327883527,
        "node_id": "MDU6SXNzdWUzMjc4ODM1Mjc=",
        "number": 2,
        "title": "Spelling error in the README file",
        "user": {
          "login": "Codertocat",
          "id": 21031067,
          "node_id": "MDQ6VXNlcjIxMDMxMDY3",
          "avatar_url": "https://avatars1.githubusercontent.com/u/21031067?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/Codertocat",
          "html_url": "https://github.com/Codertocat",
          "followers_url": "https://api.github.com/users/Codertocat/followers",
          "following_url": "https://api.github.com/users/Codertocat/following{/other_user}",
          "gists_url": "https://api.github.com/users/Codertocat/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/Codertocat/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/Codertocat/subscriptions",
          "organizations_url": "https://api.github.com/users/Codertocat/orgs",
          "repos_url": "https://api.github.com/users/Codertocat/repos",
          "events_url": "https://api.github.com/users/Codertocat/events{/privacy}",
          "received_events_url": "https://api.github.com/users/Codertocat/received_events",
          "type": "User",
          "site_admin": false
        },
        "labels": [
          {
            "id": 949737505,
            "node_id": "MDU6TGFiZWw5NDk3Mzc1MDU=",
            "url": "https://api.github.com/repos/Codertocat/Hello-World/labels/bug",
            "name": "bug",
            "color": "d73a4a",
            "default": true
          }
        ],
        "state": "open",
        "locked": false,
        "assignee": null,
        "assignees": [
          {
            "login": "Codertocat",
            "id": 21031067,
            "node_id": "MDQ6VXNlcjIxMDMxMDY3",
            "avatar_url": "https://avatars1.githubusercontent.com/u/21031067?v=4",
            "gravatar_id": "",
            "url": "https://api.github.com/users/Codertocat",
            "html_url": "https://github.com/Codertocat",
            "followers_url": "https://api.github.com/users/Codertocat/followers",
            "following_url": "https://api.github.com/users/Codertocat/following{/other_user}",
            "gists_url": "https://api.github.com/users/Codertocat/gists{/gist_id}",
            "starred_url": "https://api.github.com/users/Codertocat/starred{/owner}{/repo}",
            "subscriptions_url": "https://api.github.com/users/Codertocat/subscriptions",
            "organizations_url": "https://api.github.com/users/Codertocat/orgs",
            "repos_url": "https://api.github.com/users/Codertocat/repos",
            "events_url": "https://api.github.com/users/Codertocat/events{/privacy}",
            "received_events_url": "https://api.github.com/users/Codertocat/received_events",
            "type": "User",
            "site_admin": false
          }
        ],
        "milestone": null,
        "comments": 0,
        "created_at": "2018-05-30T20:18:32Z",
        "updated_at": "2018-05-30T20:18:32Z",
        "closed_at": null,
        "author_association": "OWNER",
        "body": "It looks like you accidently spelled 'commit' with two 't's."
      },
      "changes": {},
      "repository": {
        "id": 135493233,
        "node_id": "MDEwOlJlcG9zaXRvcnkxMzU0OTMyMzM=",
        "name": "Hello-World",
        "full_name": "Codertocat/Hello-World",
        "owner": {
          "login": "Codertocat",
          "id": 21031067,
          "node_id": "MDQ6VXNlcjIxMDMxMDY3",
          "avatar_url": "https://avatars1.githubusercontent.com/u/21031067?v=4",
          "gravatar_id": "",
          "url": "https://api.github.com/users/Codertocat",
          "html_url": "https://github.com/Codertocat",
          "followers_url": "https://api.github.com/users/Codertocat/followers",
          "following_url": "https://api.github.com/users/Codertocat/following{/other_user}",
          "gists_url": "https://api.github.com/users/Codertocat/gists{/gist_id}",
          "starred_url": "https://api.github.com/users/Codertocat/starred{/owner}{/repo}",
          "subscriptions_url": "https://api.github.com/users/Codertocat/subscriptions",
          "organizations_url": "https://api.github.com/users/Codertocat/orgs",
          "repos_url": "https://api.github.com/users/Codertocat/repos",
          "events_url": "https://api.github.com/users/Codertocat/events{/privacy}",
          "received_events_url": "https://api.github.com/users/Codertocat/received_events",
          "type": "User",
          "site_admin": false
        },
        "private": false,
        "html_url": "https://github.com/Codertocat/Hello-World",
        "description": null,
        "fork": false,
        "url": "https://api.github.com/repos/Codertocat/Hello-World",
        "forks_url": "https://api.github.com/repos/Codertocat/Hello-World/forks",
        "keys_url": "https://api.github.com/repos/Codertocat/Hello-World/keys{/key_id}",
        "collaborators_url": "https://api.github.com/repos/Codertocat/Hello-World/collaborators{/collaborator}",
        "teams_url": "https://api.github.com/repos/Codertocat/Hello-World/teams",
        "hooks_url": "https://api.github.com/repos/Codertocat/Hello-World/hooks",
        "issue_events_url": "https://api.github.com/repos/Codertocat/Hello-World/issues/events{/number}",
        "events_url": "https://api.github.com/repos/Codertocat/Hello-World/events",
        "assignees_url": "https://api.github.com/repos/Codertocat/Hello-World/assignees{/user}",
        "branches_url": "https://api.github.com/repos/Codertocat/Hello-World/branches{/branch}",
        "tags_url": "https://api.github.com/repos/Codertocat/Hello-World/tags",
        "blobs_url": "https://api.github.com/repos/Codertocat/Hello-World/git/blobs{/sha}",
        "git_tags_url": "https://api.github.com/repos/Codertocat/Hello-World/git/tags{/sha}",
        "git_refs_url": "https://api.github.com/repos/Codertocat/Hello-World/git/refs{/sha}",
        "trees_url": "https://api.github.com/repos/Codertocat/Hello-World/git/trees{/sha}",
        "statuses_url": "https://api.github.com/repos/Codertocat/Hello-World/statuses/{sha}",
        "languages_url": "https://api.github.com/repos/Codertocat/Hello-World/languages",
        "stargazers_url": "https://api.github.com/repos/Codertocat/Hello-World/stargazers",
        "contributors_url": "https://api.github.com/repos/Codertocat/Hello-World/contributors",
        "subscribers_url": "https://api.github.com/repos/Codertocat/Hello-World/subscribers",
        "subscription_url": "https://api.github.com/repos/Codertocat/Hello-World/subscription",
        "commits_url": "https://api.github.com/repos/Codertocat/Hello-World/commits{/sha}",
        "git_commits_url": "https://api.github.com/repos/Codertocat/Hello-World/git/commits{/sha}",
        "comments_url": "https://api.github.com/repos/Codertocat/Hello-World/comments{/number}",
        "issue_comment_url": "https://api.github.com/repos/Codertocat/Hello-World/issues/comments{/number}",
        "contents_url": "https://api.github.com/repos/Codertocat/Hello-World/contents/{+path}",
        "compare_url": "https://api.github.com/repos/Codertocat/Hello-World/compare/{base}...{head}",
        "merges_url": "https://api.github.com/repos/Codertocat/Hello-World/merges",
        "archive_url": "https://api.github.com/repos/Codertocat/Hello-World/{archive_format}{/ref}",
        "downloads_url": "https://api.github.com/repos/Codertocat/Hello-World/downloads",
        "issues_url": "https://api.github.com/repos/Codertocat/Hello-World/issues{/number}",
        "pulls_url": "https://api.github.com/repos/Codertocat/Hello-World/pulls{/number}",
        "milestones_url": "https://api.github.com/repos/Codertocat/Hello-World/milestones{/number}",
        "notifications_url": "https://api.github.com/repos/Codertocat/Hello-World/notifications{?since,all,participating}",
        "labels_url": "https://api.github.com/repos/Codertocat/Hello-World/labels{/name}",
        "releases_url": "https://api.github.com/repos/Codertocat/Hello-World/releases{/id}",
        "deployments_url": "https://api.github.com/repos/Codertocat/Hello-World/deployments",
        "created_at": "2018-05-30T20:18:04Z",
        "updated_at": "2018-05-30T20:18:10Z",
        "pushed_at": "2018-05-30T20:18:30Z",
        "git_url": "git://github.com/Codertocat/Hello-World.git",
        "ssh_url": "git@github.com:Codertocat/Hello-World.git",
        "clone_url": "https://github.com/Codertocat/Hello-World.git",
        "svn_url": "https://github.com/Codertocat/Hello-World",
        "homepage": null,
        "size": 0,
        "stargazers_count": 0,
        "watchers_count": 0,
        "language": null,
        "has_issues": true,
        "has_projects": true,
        "has_downloads": true,
        "has_wiki": true,
        "has_pages": true,
        "forks_count": 0,
        "mirror_url": null,
        "archived": false,
        "open_issues_count": 2,
        "license": null,
        "forks": 0,
        "open_issues": 2,
        "watchers": 0,
        "default_branch": "master"
      },
      "sender": {
        "login": "Codertocat",
        "id": 21031067,
        "node_id": "MDQ6VXNlcjIxMDMxMDY3",
        "avatar_url": "https://avatars1.githubusercontent.com/u/21031067?v=4",
        "gravatar_id": "",
        "url": "https://api.github.com/users/Codertocat",
        "html_url": "https://github.com/Codertocat",
        "followers_url": "https://api.github.com/users/Codertocat/followers",
        "following_url": "https://api.github.com/users/Codertocat/following{/other_user}",
        "gists_url": "https://api.github.com/users/Codertocat/gists{/gist_id}",
        "starred_url": "https://api.github.com/users/Codertocat/starred{/owner}{/repo}",
        "subscriptions_url": "https://api.github.com/users/Codertocat/subscriptions",
        "organizations_url": "https://api.github.com/users/Codertocat/orgs",
        "repos_url": "https://api.github.com/users/Codertocat/repos",
        "events_url": "https://api.github.com/users/Codertocat/events{/privacy}",
        "received_events_url": "https://api.github.com/users/Codertocat/received_events",
        "type": "User",
        "site_admin": false
      }
    }
  ]
}
```

## Download webhook definitions and webhook payloads schema

You can download the latest `index.json` and `schema.json` files from
[unpkg](https://unpkg.com/browse/@octokit/webhooks-definitions@3.24.0/)

- [`index.json`](https://unpkg.com/@octokit/webhooks-definitions/index.json)
- [`schema.json`](https://unpkg.com/@octokit/webhooks-definitions/schema.json)

## Usage as Node module

To get an array of all webhook definition objects, require the `index.json` file

```js
// Use Node.js require:
const WEBHOOKS = require("@octokit/webhooks-definitions/index.json");

// Or ESM/TypeScript import:
import WEBHOOKS from "@octokit/webhooks-definitions/index.json";
```

To get the JSON schema for webhook payloads, require the `schema.json` file

```js
// Use Node.js require:
const SCHEMA = require("@octokit/webhooks-definitions/schema.json");

// Or ESM/TypeScript import:
import SCHEMA from "@octokit/webhooks-definitions/schema.json";
```

### Usage with `ajv` in `strict` mode

When running in `strict` mode, `ajv` will throw an "unknown keyword" error if it
encounters any keywords that have not been defined.

This schema currently uses custom keywords provided by `ajv-formats`, along with
the custom keyword `tsAdditionalProperties`.

Here is an example of how you can set this up:

```ts
import type { WebhookEvent } from "@octokit/webhooks-definitions/schema";
import * as githubWebhookSchema from "@octokit/webhooks-definitions/schema.json";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({ strict: true });

addFormats(ajv);
ajv.addKeyword("tsAdditionalProperties");

const validate = ajv.compile<WebhookEvent>(githubWebhookSchema);
```

## Importing types

This package ships with types for the webhook events generated from the
respective json schemas, which you can use like so:

```typescript
import {
  WebhookEvent,
  IssuesOpenedEvent,
} from "@octokit/webhooks-definitions/schema";

const handleWebhookEvent = (event: WebhookEvent) => {
  if ("action" in event && event.action === "completed") {
    console.log(`${event.sender.login} completed something!`);
  }
};

const handleIssuesOpenedEvent = (event: IssuesOpenedEvent) => {
  console.log(
    `${event.sender.login} opened "${event.issue.title}" on ${event.repository.full_name}`
  );
};
```

## How it works

This package updates itself using a daily cronjob running on GitHub Actions. The
[`index.json`](index.json) file is generated by
[`bin/octokit-webhooks.ts`](bin/octokit-webhooks.ts). Run
`npm run octokit-webhooks -- --usage` for instructions. After the update is
complete, run `npm run build:webhooks` and `npm run build:schema` to update
`index.json` and `schema.json` files.

The update script is scraping
[GitHub’s Webhooks Event Types & Payloads](https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/webhook-events-and-payloads)
documentation page and extracts the meta information using
[cheerio](https://www.npmjs.com/package/cheerio).

For simpler local testing and tracking of changes all loaded pages are cached in
the [`cache/`](cache/) folder.

## See also

- [octokit/graphql-schema](https://github.com/octokit/graphql-schema) – GitHub’s
  GraphQL Schema with validation
- [octokit/openapi](https://github.com/octokit/openapi) – GitHub REST API route
  specifications
- [octokit/app-permissions](https://github.com/octokit/app-permissions) – GitHub
  App permission specifications

## LICENSE

[MIT](LICENSE.md)
