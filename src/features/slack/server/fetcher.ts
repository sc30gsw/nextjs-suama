import type { UsersLookupByEmailArguments } from '@slack/web-api'
import 'server-only'
import { getSlackClientManager, getSlackWebClient, initializeSlackClient } from '~/lib/slack'

export async function getSlackUserLookupByEmail(email: UsersLookupByEmailArguments['email']) {
  try {
    const manager = getSlackClientManager()

    if (!manager.isInitialized()) {
      initializeSlackClient()
    }

    const client = getSlackWebClient()

    return await client.users.lookupByEmail({
      email,
    })
  } catch (error) {
    console.error('Error fetching allowed Slack users:', error)

    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
