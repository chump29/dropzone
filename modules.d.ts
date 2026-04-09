declare module "bun" {
  interface Env {
    CHANNEL_ID: string;
    DB_NAME: string;
    DB_PATH: string;
    DEBUG: boolean;
    npm_package_version: string;
    TOKEN: string;
  }
}
