'use strict';

const _			= require('lodash');
const expect 	= require('chai').expect;
const validate  = require('../../src/manifest/validate');

describe('manifest.validate()', () => {

	let error, result;

	const next = done => (err, res) => {
		error = err;
		result = res;
		done();
	};

    const dest = 'src/locales/${locale}/${filename}';

	const repository = {
		manifestContent: {
			smartlingProjectId: 'test-id',
			translations: [{
				input: {
					src: 'src/locales/en-us/*.json'
				},
				output: {
					dest
				}
			}]
		}
	};

	describe('when validating valid manifest', () => {

		describe('happy path', () => {

			beforeEach(done => validate(repository, next(done)));

			it('should be valid', () => {
				expect(error).to.be.null;
				expect(result).to.be.eql(repository);
			});
		});

		describe('when missing smartlingProjectId', () => {

			const invalid = {
				manifestContent: _.omit(repository.manifestContent, 'smartlingProjectId')
			};

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"smartlingProjectId" is required');
			});
		});

		describe('when missing translations', () => {

			const invalid = {
				manifestContent: _.omit(repository.manifestContent, 'translations')
			};

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"translations" is required');
			});
		});

		describe('when translations empty', () => {

			const invalid = _.cloneDeep(repository);
			invalid.manifestContent.translations = [];

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"translations" does not contain 1 required value(s)');
			});
		});

		describe(`when translation source doesn't contain src path`, () => {

			const invalid = _.cloneDeep(repository);
			delete invalid.manifestContent.translations[0].input.src;

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"src" is required');
			});
		});

		describe(`when translation source contains src path as array`, () => {

			const cloned = _.cloneDeep(repository);
			cloned.manifestContent.translations[0].input.src = [cloned.manifestContent.translations[0].input.src];

			beforeEach(done => validate(cloned, next(done)));

			it('should be valid', () => {
				expect(error).to.be.null;
				expect(result).to.be.eql(cloned);
			});
		});

		describe(`when translation output doesn't contain dest path`, () => {

			const invalid = _.cloneDeep(repository);
			delete invalid.manifestContent.translations[0].output.dest;

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('"dest" is required');
			});
		});

        describe(`when translation output doesn't contain $locale placeholder`, () => {

			const invalid = _.cloneDeep(repository);
			invalid.manifestContent.translations[0].output.dest = dest.replace('${locale}', '${lol}');

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('fails to match the required pattern: /(\\${locale}\\/\\${filename})/]]]]');
			});
		});

        describe(`when translation output doesn't contain $filename placeholder`, () => {

			const invalid = _.cloneDeep(repository);
			invalid.manifestContent.translations[0].output.dest = dest.replace('${filename}', '${YOLO}');

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('fails to match the required pattern: /(\\${locale}\\/\\${filename})/]]]]');
			});
		});

        describe(`when translation output doesn't contain $filename or $locale placeholder`, () => {

			const invalid = _.cloneDeep(repository);
			invalid.manifestContent.translations[0].output.dest = dest.replace('${locale}/${filename}', '${lol}/${YOLO}');

			beforeEach(done => validate(invalid, next(done)));

			it('should not be valid', () => {
				expect(error.toString()).to.contain('fails to match the required pattern: /(\\${locale}\\/\\${filename})/]]]]');
			});
		});
	});
});
