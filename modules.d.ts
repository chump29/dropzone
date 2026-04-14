declare module "bun" {
  interface Env {
    CHANNEL_ID: string
    DB_NAME: string
    DB_PATH: string
    DEBUG: boolean
    LOGO_PORT: number
    LOGO_SERVER: boolean
    LOGO_URL: string
    NAME: string
    npm_package_version: string
    RATE: number
    TOKEN: string
  }
}
