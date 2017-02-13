const _ = require('lodash');

const github = new require('github')({
    protocol: 'https',
    host: 'api.github.com',
    headers: {
        'user-agent': 'mercury'
    },
    followRedirects: false,
    timeout: 5000
});


github.authenticate({
    type: 'oauth',
    token: '5b2266e82788869e4b8626123b60229734a00633'
});

const baseOptions = {
    owner: 'mercurybot',
    repo: 'mercury-sandbox'
};

const refOptions = _.cloneDeep(baseOptions);
refOptions.ref = 'heads/master';

//fork
//branch
github.gitdata.getReference(refOptions, (err, reference) => {
    console.log(reference);
    const getCommitOptions = _.cloneDeep(baseOptions);
    getCommitOptions.sha = reference.object.sha;
    github.gitdata.getCommit(getCommitOptions, (err, commit) => {
        const parentCommitSha = commit.sha;
        const baseTreeSha = commit.tree.sha;
        const createBlobOptions = _.cloneDeep(baseOptions);
        createBlobOptions.content = 'test file content';
        createBlobOptions.encoding = 'utf-8';
        github.gitdata.createBlob(createBlobOptions, (err, blob) => {
            const createdBlobSha = blob.sha;
            const getBaseTreeOptions = _.cloneDeep(baseOptions);
            getBaseTreeOptions.sha = baseTreeSha;
            github.gitdata.getTree(getBaseTreeOptions, (err, baseTree) => {
                const createTreeOptions = _.cloneDeep(baseOptions);
                createTreeOptions.base_tree = baseTreeSha;
                createTreeOptions.tree = [];
                createTreeOptions.tree.push({
                    path: 'test.txt',
                    mode: '100644',
                    type: 'blob',
                    sha: createdBlobSha 
                });
                console.log(createTreeOptions);
                github.gitdata.createTree(createTreeOptions, (err, tree) => {
                    const createCommitOptions = _.cloneDeep(baseOptions);
                    createCommitOptions.message = 'test commit';
                    createCommitOptions.tree = tree.sha;
                    createCommitOptions.parents = [parentCommitSha];
                    github.gitdata.createCommit(createCommitOptions, (err, newCommit) => {
                        const updateReferenceOptions = _.cloneDeep(baseOptions);
                        updateReferenceOptions.ref = 'heads/master';
                        updateReferenceOptions.sha = newCommit.sha;
                        github.gitdata.updateReference(updateReferenceOptions, (err, result) => {
                            console.log(err);
                            console.log(result);
                        });
                    });
                });
            });
        });
    });
});
