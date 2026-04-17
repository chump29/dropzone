import { info } from "./logger.ts"

let SERVER: Bun.Server<undefined> | null = null

const DEFAULT_PORT: number = 8001

const PORT: number = Bun.env.LOGO_PORT ? Number(Bun.env.LOGO_PORT) : DEFAULT_PORT

const logo = async (): Promise<void> => {
  if (Bun.env.LOGO_SERVER === "true") {
    SERVER = Bun.serve({
      port: PORT,
      fetch(request: Request): Response {
        if (new URL(request.url).pathname === "/dropzonebot.png") {
          return new Response(Bun.file(`${import.meta.dirname}/images/dropzonebot.png`))
        }
        return new Response("Not Found", {
          status: 404
        })
      }
    })

    if (Bun.env.DEBUG) {
      info("Logo server started")
    }
  }
}

export { logo, SERVER }
