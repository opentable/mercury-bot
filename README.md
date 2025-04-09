<div align="center">
    <img width="200" height="200" src="docs/mercury-logo.png">

<br>
<br>
<h1>Mercury</h1>
<p>Mercury is a bot for handling in-code static translations. Developed at <a href="https://www.opentable.com">OpenTable</a>, it takes care of dozens of codebases by making automated Pull Requests to keep the code up to date with our translations.</p>
</div>

***

### How Mercury works

The bot looks for a `mercury.json` manifest file in a repository's root. It then locates the source files and keeps them updated with [Smartling](https://smartling.com/) by using its API and making Pull Requests. Please refer to the [Mercury consumer integration runbook](https://github.com/opentable/mercury-bot/blob/master/docs/integration-runbook.md) and [FAQ](https://github.com/opentable/mercury-bot/blob/master/docs/faq.md).

![Mercury screenshot](docs/screenshot.png)

### How to setup the bot in your organization

Mercury is available as [npm module](https://www.npmjs.com/package/mercury-bot) and needs to be configured to run with github and smartling API tokens.

Here is a code example:

```js
const mercury = require('mercury-bot');

const config = {
  github: {
    apiTokens: [
      { operation: 'read', value: 'token-1234567890' },
      { operation: 'write', value: 'token-0987654321' }
    ],
    owner: 'mercurybot',
    branch: 'mercury'
  },
  smartling: {
    userIdentifier: 'userId-1234567890',
    userSecret: 'userSecret-0987654321'
  },
  repositories: {
    'github-org': ['repo1', 'repo2']
  }
};

const app = mercury({ config });

// Optional event handlers
app.on('error', console.log);
app.on('action', console.log);
app.on('result', console.log);

// Run
app.run(() => process.exit(0));
```

#### API

##### Init mercury({ config })

`config` is an object that requires the following structure:

|name|type|mandatory|description|
|----|----|---------|-----------|
|`github`|`object`|`yes`|Github config|
|`github.apiTokens`|`object`|`yes`|Github API Tokens. You need at least one read token and one write token|
|`github.apiTokens[index].operation`|`string`|`yes`|Can be either `read` or `write`|
|`github.apiTokens[index].value`|`string`|`yes`|The token|
|`github.owner`|`string`|`yes`|The github user associated with the token|
|`github.branch`|`string`|`yes`|The branch that the bot will use to make Pull Requests on his fork|
|`repositories`|`object`|`yes`|The repositories mercury needs to watch and manage|
|`repositories[index]`|`array of strings`|`yes`|The github org that contains the repos to watch|
|`repositories[index][item]`|`string`|`yes`|The github repo to watch|
|`smartling`|`object`|`yes`|The smartling config|
|`smartling.userIdentifier`|`string`|`yes`|The smartling UserId|
|`smartling.userSecret`|`string`|`yes`|The smartling UserSecret|
|`bucketsCount`|`number`|`no`|Buckets count. The current bucket is selected based on the current UTC hour. The value must be between 1 and 24. The default value is 1|

##### mercury.on(eventName, payload)

Event handler for connecting to a logger. The following events are emitted:

|name|payload object props|description|
|----|--------------------|-----------|
|`action`|`{ message}`|The message contains a description of the performed action|
|`error`|`{ error, errorType, details }`|The error is a Javascript `Error` object containing the whole stacktrace. The errorType is a string identifier for the error, and the details contains all the state of the performed actions for the current repository for further investigation|
|`result`|`{ message, resultType }`|The message contains a description of the performed action, the resultType is an identifier for the current action|

#### License

MIT
