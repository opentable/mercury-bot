"use strict";

const prMetaDataCalculator = require("./calculate-pr-metadata");

const buildExcludedStringWarning = () => {
  return "> :warning: WARNING\n>\n> Your project contains excluded strings. This typically indicates strings that are being managed outside of Smartling workflow. See [Mercury FAQ](https://github.com/opentable/mercury-bot/blob/master/docs/faq.md) for more information.\n";
};

const buildHeaderForFile = (file, percentCompletedByFile) => {
  const stringBreakDownHeader = `| | excluded strings | translated strings | total strings | % |\n|---|---|---|---|---|\n`;
  return `\n**Translation status of \`${
    file.src
  }\`: ${percentCompletedByFile}%**\n\n${
    percentCompletedByFile !== 100 ? stringBreakDownHeader : ""
  }`;
};

const buildPercentageStat = (percentage) => {
  return percentage || percentage === 0 ? `${percentage.toString()}%` : "N/A";
};

const buildPullRequestInstructions = (averageCompletion) => {
  const status =
    averageCompletion !== 100
      ? "> :white_check_mark: This is safe to merge. If merge conflicts appear, you can close this PR and Mercury will open a new, rebased PR for you.\n\n"
      : "";
  return status;
};

const buildPullRequestStatus = (averageCompletion) => {
  return `(${buildPercentageStat(averageCompletion)} Overall Completion)`;
};

const buildTitle = (averageCompletion) => {
  return `Mercury Pull Request ${buildPullRequestStatus(averageCompletion)}`;
};

const buildExcludedStringLink = (smartlingProjectId, localeKey) => {
  return (
    " ([view in Smartling](https://dashboard.smartling.com/projects/" +
    smartlingProjectId +
    "/content/content.htm#excluded/list/filter/locale:" +
    localeKey +
    "))"
  );
};

const format = (repository) => {
  const averageCompletion = prMetaDataCalculator.calculateAverage(
    prMetaDataCalculator.sumPercentageCompletedOverall(repository),
    prMetaDataCalculator.countLocales(repository)
  );

  const title = buildTitle(averageCompletion);

  let body = "";

  body += buildPullRequestInstructions(averageCompletion);

  if (prMetaDataCalculator.countExcludedStrings(repository) > 0) {
    body += buildExcludedStringWarning();
  }

  body += repository.translationFiles.reduce(
    (accumulatorForTranslationFiles, file) => {
      const totalStringCount = file.totalStringCount;

      const sortedLocales = prMetaDataCalculator.sortLocales(file.locales);
      const percentCompletedByFile =
        prMetaDataCalculator.sumPercentageCompletedByFile(sortedLocales);

      if (percentCompletedByFile === 100) {
        return accumulatorForTranslationFiles.concat(
          buildHeaderForFile(file, percentCompletedByFile)
        );
      }

      return accumulatorForTranslationFiles.concat(
        buildHeaderForFile(file, percentCompletedByFile),
        sortedLocales.reduce((accumulatorForLocales, locale) => {
          const localeStatus = locale.value.smartlingStatus;
          const excludedStringCount = localeStatus.excludedStringCount || 0;
          const completedStringCount = localeStatus.completedStringCount || 0;
          const percentage = localeStatus.percentCompleted;

          return accumulatorForLocales.concat(
            `| **${locale.key}** | ${excludedStringCount}${
              excludedStringCount > 0
                ? buildExcludedStringLink(
                    repository.manifestContent.smartlingProjectId,
                    locale.key
                  )
                : ""
            } | ${completedStringCount} | ${totalStringCount} | ${buildPercentageStat(
              percentage
            )} |\n`
          );
        }, "")
      );
    },
    ""
  );

  return {
    body,
    title,
  };
};

module.exports = {
  format,
};
