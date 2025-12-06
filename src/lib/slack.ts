import type { WebClientOptions } from '@slack/web-api'
import { LogLevel, WebClient } from '@slack/web-api'
import { env } from '~/env'

type SlackConfig = Record<'botToken', string>

type SlackWebClientOptions = WebClientOptions

class SlackClientManager {
  private static instance: SlackClientManager
  private webClient: WebClient | null = null
  private config: SlackConfig | null = null

  private constructor() {}

  public static getInstance(): SlackClientManager {
    if (!SlackClientManager.instance) {
      SlackClientManager.instance = new SlackClientManager()
    }

    return SlackClientManager.instance
  }

  public initialize(config: SlackConfig): void {
    this.config = config

    const webClientOptions = {
      retryConfig: {
        retries: 3,
        factor: 2.0,
      },
      logLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
    } as const satisfies SlackWebClientOptions

    this.webClient = new WebClient(config.botToken, webClientOptions)
  }

  public getWebClient() {
    if (!this.webClient) {
      throw new Error('SlackClientManager is not initialized. Call initialize() first.')
    }

    return this.webClient
  }

  public isInitialized() {
    return this.webClient !== null && this.config !== null
  }
}

function getSlackConfigFromEnv() {
  const botToken = env.SLACK_BOT_TOKEN

  if (!botToken) {
    throw new Error('SLACK_BOT_TOKEN environment variable is required')
  }

  return {
    botToken,
  } as const
}

export function initializeSlackClient() {
  const config = getSlackConfigFromEnv()
  const manager = SlackClientManager.getInstance()

  manager.initialize(config)

  return manager
}

export function getSlackWebClient() {
  return SlackClientManager.getInstance().getWebClient()
}

export function getSlackClientManager() {
  return SlackClientManager.getInstance()
}

export { SlackClientManager }
