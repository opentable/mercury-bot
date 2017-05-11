'use strict';

const _ = require('lodash');
const async = require('async');
const config = require('config');
const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const Logger = require('../services/logger-service');

const loggerService = Logger();

const retryPolicy = {
    times: 5,
    interval: retryCount => 200 * retryCount
};

module.exports = (repository, callback) => {

    loggerService.info(`Committing new or updated files to ${repository.mercuryForkOwner}/${repository.repo}`);
    
    let commitCount = 0;

    async.eachSeries(repository.translationFiles, (file, callback) => {
        async.eachOfSeries(file.locales, (locale, localeId, callback) => {

            const options = {
                owner: config.github.owner,
                repo: repository.repo,
                path: locale.githubPath,
                ref: config.github.branch,
                content: locale.smartlingContent,
                message: `Mercury commit for ${localeId} to file ${locale.githubPath}`
            };

            github.getFile(options, (err, file) => {
                if(err && err.code !== 404){
                    return callback(new Error(err.message));
                }

                const content = file.content;
                const sha = file.sha;

                _.set(options, 'branch', options.ref);
                _.unset(options, 'ref');

                if(!content) {
                    loggerService.info(`Creating new ${localeId} file ${locale.githubPath} on ${repository.mercuryForkOwner}/${repository.repo}`);
                    commitCount++;
                    async.retry(retryPolicy, github.createFile.bind(null, options), callback);

                } else if(content && content !== locale.smartlingContent) {
                    loggerService.info(`Updating existing ${localeId} file ${locale.githubPath} on ${repository.mercuryForkOwner}/${repository.repo}`);
                    options.sha = sha;
                    commitCount++;
                    async.retry(retryPolicy, github.updateFile.bind(null, options), callback);
                } else {
                    return callback();
                }
            });

        }, callback);
    }, (err) => {
        
        if(commitCount === 0) {
            repository.skipPullRequest = true;
        }

        if(err){
            err = new Error(err.message);
            loggerService.error(err, errorTypes.failedGithubCommit, repository);
            repository.skip = true;
        }

        callback(err, repository);
    });
};
