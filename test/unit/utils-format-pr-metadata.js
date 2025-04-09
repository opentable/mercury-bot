"use strict";

const _ = require("lodash");
const expect = require("chai").expect;
const metadataFormatter = require("../../src/utils/format-pr-metadata");
const testData = require("./testData");

describe("metadataFormatter.format()", () => {
  describe("PR title", () => {
    let res;

    beforeEach((done) => {
      const repo = testData.postPullRequestFetchInfoRepository;
      res = metadataFormatter.format(_.cloneDeep(repo));
      done();
    });

    it("should include a title for the Pull Request", () => {
      expect(res.title).to.include(
        "Mercury Pull Request (45.8% Overall Completion)"
      );
    });
  });

  describe("PR status - happy path - not complete", () => {
    let res;

    beforeEach((done) => {
      const repo = testData.postPullRequestFetchInfoRepository;
      res = metadataFormatter.format(_.cloneDeep(repo));
      done();
    });

    it("should not include an excluded string warning", () => {
      expect(res.body).to.not.include(
        "> :warning: WARNING\n>\n> Your project contains excluded strings. This typically indicates strings that are being managed outside of Smartling workflow. See [Mercury FAQ](https://github.com/opentable/mercury-bot/blob/master/docs/faq.md) for more information."
      );
    });

    it("should include instructions on how to manage the PR", () => {
      expect(res.body).to.include(
        "> :white_check_mark: This is safe to merge. If merge conflicts appear, you can close this PR and Mercury will open a new, rebased PR for you.\n\n"
      );
    });

    it("should include a headline for src/locales/en-us/file.json", () => {
      expect(res.body).to.include(
        "Translation status of `src/locales/en-us/file.json`: 55%"
      );
    });

    it("should include a headline for src/locales/en-us/other-file.json", () => {
      expect(res.body).to.include(
        "Translation status of `src/locales/en-us/other-file.json`: 36.7%"
      );
    });

    it("should include a header for the locale table", () => {
      expect(res.body).to.include(
        "| | excluded strings | translated strings | total strings | % |\n|---|---|---|---|---|"
      );
    });

    it("should include the status of src/locales/en-us/file.json", () => {
      expect(res.body).to.include("| **de-DE** | 0 | 1 | 10 | 10% |");
      expect(res.body).to.include("| **nl-NL** | 0 | 10 | 10 | 100% |");
    });

    it("should include the body of src/locales/en-us/other-file.json", () => {
      expect(res.body).to.include("| **de-DE** | 0 | 22 | 30 | 73.3% |");
      expect(res.body).to.include("| **nl-NL** | 0 | 0 | 30 | 0% |");
    });
  });

  describe("PR status - happy path - complete", () => {
    let res;

    beforeEach((done) => {
      const repo = testData.postPullRequestFetchInfoRepositoryComplete;
      res = metadataFormatter.format(_.cloneDeep(repo));
      done();
    });

    it("should not include an excluded string warning", () => {
      expect(res.body).to.not.include(
        "> :warning: WARNING\n>\n> Your project contains excluded strings. This typically indicates strings that are being managed outside of Smartling workflow. See [Mercury FAQ](https://github.com/opentable/mercury-bot/blob/master/docs/faq.md) for more information."
      );
    });

    it("should not include instructions on how to manage the PR", () => {
      expect(res.body).to.not.include(
        "> :white_check_mark: This is safe to merge.\n>\n> If conflicts appear, the likely cause is that translation files were manually changed while Mercury was running.\nIn that case, you can close this PR: a new one will be opened with no conflicts.\n\n"
      );
    });

    it("should include a headline for src/locales/en-us/file.json", () => {
      expect(res.body).to.include(
        "Translation status of `src/locales/en-us/file.json`: 100%"
      );
    });

    it("should include a headline for src/locales/en-us/other-file.json", () => {
      expect(res.body).to.include(
        "Translation status of `src/locales/en-us/other-file.json`: 100%"
      );
    });

    it("should not include a header for the locale table", () => {
      expect(res.body).to.not.include(
        "| | excluded strings | translated strings | total strings | % |\n|---|---|---|---|---|"
      );
    });

    it("should not include the status of src/locales/en-us/file.json", () => {
      expect(res.body).to.not.include("| **de-DE** | 0 | 10 | 10 | 100% |");
      expect(res.body).to.not.include("| **nl-NL** | 0 | 10 | 10 | 100% |");
    });

    it("should not include the body of src/locales/en-us/other-file.json", () => {
      expect(res.body).to.not.include("| **de-DE** | 0 | 30 | 30 | 100% |");
      expect(res.body).to.not.include("| **nl-NL** | 0 | 30 | 30 | 100% |");
    });
  });

  describe("PR status - excluded strings", () => {
    let res;

    beforeEach((done) => {
      const repo =
        testData.postPullRequestFetchInfoRepositoryWithExcludedStrings;
      res = metadataFormatter.format(_.cloneDeep(repo));
      done();
    });

    it("should include an excluded string warning", () => {
      expect(res.body).to.include(
        "> :warning: WARNING\n>\n> Your project contains excluded strings. This typically indicates strings that are being managed outside of Smartling workflow. See [Mercury FAQ](https://github.com/opentable/mercury-bot/blob/master/docs/faq.md) for more information."
      );
    });

    it("should include instructions on how to manage the PR", () => {
      expect(res.body).to.include(
        "> :white_check_mark: This is safe to merge. If merge conflicts appear, you can close this PR and Mercury will open a new, rebased PR for you.\n\n"
      );
    });

    it("should include a headline for src/locales/en-us/file.json", () => {
      expect(res.body).to.include(
        "Translation status of `src/locales/en-us/file.json`:"
      );
    });

    it("should include a headline for src/locales/en-us/other-file.json", () => {
      expect(res.body).to.include(
        "Translation status of `src/locales/en-us/other-file.json`:"
      );
    });

    it("should include the status of src/locales/en-us/file.json", () => {
      expect(res.body).to.include("| **de-DE** | 0 | 1 | 10 | 10% |");
      expect(res.body).to.include(
        "| **nl-NL** | 1 ([view in Smartling](https://dashboard.smartling.com/projects/ABCDEF/content/content.htm#excluded/list/filter/locale:nl-NL)) | 10 | 10 | 100% |"
      );
    });

    it("should include the body of src/locales/en-us/other-file.json", () => {
      expect(res.body).to.include(
        "| **de-DE** | 2 ([view in Smartling](https://dashboard.smartling.com/projects/ABCDEF/content/content.htm#excluded/list/filter/locale:de-DE)) | 22 | 30 | 73.3% |"
      );
      expect(res.body).to.include("| **nl-NL** | 0 | 0 | 30 | 0% |");
    });
  });

  describe("missing smartlingStatus", () => {
    let res;

    beforeEach((done) => {
      const repo = testData.postPullRequestFetchInfoRepository;
      repo.translationFiles[0].locales["de-DE"].smartlingStatus = {};
      res = metadataFormatter.format(_.cloneDeep(repo));
      done();
    });

    it("should insert N/A everywhere for that locale", () => {
      expect(res.body).to.include("| **de-DE** | 0 | 0 | 10 | N/A |");
    });
  });
});
