'use strict';

const errorTypes = require('../constants/error-types');
const github = require('../services/github');

module.exports = loggerService => (repository, callback) => {
  if (!repository.prInfo.found || !repository.prInfo.outdated) {
    return callback(null, repository);
  }

  loggerService.console(`Closing outdated pull request for ${repository.owner}/${repository.repo}`);

  const prOptions = {
    number: repository.prInfo.number,
    owner: repository.owner,
    repo: repository.repo
  };

  github.closePullRequest(prOptions, err => {
    if (err) {
      err = new Error('Failed while closing pull request');
      loggerService.error(err, errorTypes.failedToClosePullRequest, repository);
      repository.skip = true;
    }

    repository.prInfo.closed = true;

    callback(err, repository);
  });
};
