'use strict';

const errorTypes = require('../constants/error-types');
const github = require('../services/github');
const Logger = require('../services/logger-service');

const loggerService = Logger();

module.exports = (repository, callback) => {

    loggerService.info(`Ensuring existence and validity of a Mercury fork for ${repository.owner}/${repository.repo}`);
    
    const options = {
        owner: repository.owner,
        repo: repository.repo
    };
        
    github.ensureFork(options, (err, result) => {
        
        if(err){
            loggerService.error(err, errorTypes.failedGithubFork, repository);
            repository.skip = true;
            return callback(err, repository);
        }
        
        repository.mercuryForkName = result && result.full_name ? result.full_name : null;
        repository.mercuryForkOwner = result && result.owner ? result.owner.login: null;

        const masterUpstreamOptions = {
            branch: 'master',
            owner: repository.owner,
            repo: repository.repo
        };

        github.getBranchReference(masterUpstreamOptions, (err, masterSha) => {

            if(err){
                err = new Error('Could not fetch the upstream/master reference');
                loggerService.error(err, errorTypes.failedToFetchMasterReference, repository);
                repository.skip = true;
                return callback(err, repository);
            }

            const forkOptions = {
                branch: 'master',
                owner: repository.mercuryForkOwner,
                reference: masterSha,
                repo: repository.repo
            };

            github.updateReference(forkOptions, (err) => {

                if(err){
                    err = new Error('Could not rebase fork from upstream/master');
                    loggerService.error(err, errorTypes.failedGithubForkRebase, repository);
                    repository.skip = true;
                }

                callback(err, repository);
            });
        });
    });
};
