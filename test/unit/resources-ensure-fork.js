'use strict';

const _         = require('lodash');
const expect 	= require('chai').expect;
const injectr	= require('injectr');
const sinon		= require('sinon');
const testData = require('./testData');

describe('resources.ensureFork()', () => {
    
    const mockedEnsureFork = (githubStub) => injectr('../../src/resources/ensure-fork.js', {
        '../services/github': {
            ensureFork: githubStub
        }
    });
    const repository = testData.postGithubFetchRepository;
    
    describe('happy path', () => {
    
        let err, res;
        
        beforeEach((done) => {
            const githubStub = sinon.stub().yields(null, { full_name: 'testOwner/testRepo', owner: { login: 'testOwner' } });
            
            mockedEnsureFork(githubStub)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should not error', () => {
            expect(err).to.be.null;
        });

        it('should append mercuryForkName and mercuryForkOwner to repository', () => {
            expect(res.mercuryForkName).to.eql('testOwner/testRepo');
            expect(res.mercuryForkOwner).to.eql('testOwner');
        });
    });
    
    describe('when forking fails with an error', () => {
        
        let err, res;
        
        beforeEach((done) => {
            const githubStub = sinon.stub().yields({ message: 'Could not create the fork', code: 422 }, { content: null });
            
            mockedEnsureFork(githubStub)(_.cloneDeep(repository), (error, result) => {
                err = error;
                res = result;
                done();
            });
        });

        it('should show an error', () => {
            expect(err.message).to.contain('Could not create the fork');
        });

        it('should mark the repo for being skipped', () => {
            expect(res.skip).to.be.true;
        });
    });
});
