export function createReadingLogIssueUrl({
  repoOwner,
  repoName,
  paperId
}: {
  repoOwner: string;
  repoName: string;
  paperId: string;
}) {
  const params = new URLSearchParams({
    template: "reading-log.yml",
    title: `[Reading Log]: ${paperId}`,
    labels: "reading-log"
  });

  return `https://github.com/${repoOwner}/${repoName}/issues/new?${params.toString()}`;
}

export function createPaperSuggestionIssueUrl({
  repoOwner,
  repoName
}: {
  repoOwner: string;
  repoName: string;
}) {
  const params = new URLSearchParams({
    template: "paper-suggestion.yml",
    title: "[Paper Suggestion]: ",
    labels: "paper-suggestion"
  });

  return `https://github.com/${repoOwner}/${repoName}/issues/new?${params.toString()}`;
}

export function createRepoUrl(repoOwner: string, repoName: string) {
  return `https://github.com/${repoOwner}/${repoName}`;
}
