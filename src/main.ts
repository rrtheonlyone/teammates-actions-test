import * as core from '@actions/core'
import * as github from '@actions/github'
import {
  TestStatus,
  addComment,
  addLabel,
  getCurrentPR,
  getTestStatus,
  removeLabel
} from './github'

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function run(): Promise<void> {
  try {
    const authToken: string = core.getInput('token')
    const pr = await getCurrentPR(authToken)
    if (pr.status !== 200) {
      return
    }

    if (github.context.eventName === 'issue_comment') {
      const comment = github.context.payload.comment
      if (!comment) {
        return
      }

      const body: string = comment.body
      if (body.search('PR ready for review') === -1) {
        return
      }
    }

    if (pr.data.draft) {
      addLabel('s.Ongoing', authToken)
      removeLabel(authToken, 's.ToReview')
      return
    }

    let status = TestStatus.RUNNING
    while (status === TestStatus.RUNNING) {
      status = await getTestStatus(authToken)
      delay(2000)
    }

    if (status === TestStatus.FAILED) {
      addComment(
        authToken,
        'Tests Failed! Please fix and add a comment with the message "PR Ready for Review"'
      )
      removeLabel(authToken, 's.ToReview')
      return
    }

    addLabel(authToken, 's.ToReview')
    removeLabel(authToken, 's.Ongoing')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
