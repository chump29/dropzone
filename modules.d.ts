declare module "bun" {
  interface Env {
    AUTOSTART: string
    CHANNEL_ID: string
    DB_NAME: string
    DB_PATH: string
    DEBUG: boolean
    DEBUG_SQL: string
    EMOJI: string
    IS_DEBUG: string
    LOGO_URL: string
    MAX_TIME: string
    MIN_TIME: string
    NAME: string
    npm_package_version: string
    TIMEOUT: string
    TOKEN: string
  }
}
