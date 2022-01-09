import * as github from '@actions/github'
import {Endpoints} from '@octokit/types'

type GetPRType =
  Endpoints['GET /repos/{owner}/{repo}/pulls/{pull_number}']['response']

export async function getCurrentPR(authToken: string): Promise<GetPRType> {
  const octokit = github.getOctokit(authToken)
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
  const issue_number = github.context.issue.number

  return await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number: issue_number
  })
}

export async function addLabel(authToken: string, tag: string): Promise<void> {
  const octokit = github.getOctokit(authToken)
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
  const issue_number = github.context.issue.number

  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number,
    labels: [tag]
  })
}

export async function removeLabel(
  authToken: string,
  tag: string
): Promise<void> {
  const octokit = github.getOctokit(authToken)
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
  const issue_number = github.context.issue.number

  await octokit.rest.issues.removeLabel({
    owner,
    repo,
    issue_number,
    name: tag
  })
}

export const enum TestStatus {
  OK,
  FAILED,
  RUNNING
}

export async function getTestStatus(authToken: string): Promise<TestStatus> {
  const octokit = github.getOctokit(authToken)
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo

  const tests = await octokit.rest.checks.listForRef({
    owner,
    repo,
    ref: github.context.ref
  })

  const valid_tests = tests.data.check_runs.filter(t => t.name !== 'Workflow')

  if (valid_tests.findIndex(c => c.conclusion === 'failure') !== -1) {
    return TestStatus.FAILED
  }

  if (valid_tests.findIndex(c => c.status !== 'completed') !== -1) {
    return TestStatus.RUNNING
  }

  return TestStatus.OK
}

export async function addComment(
  authToken: string,
  comment: string
): Promise<void> {
  const octokit = github.getOctokit(authToken)
  const owner = github.context.repo.owner
  const repo = github.context.repo.repo
  const issue_number = github.context.issue.number

  await octokit.rest.issues.createComment({
    owner,
    repo,
    issue_number,
    body: comment
  })
}
