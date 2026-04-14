import { info } from "./logger.ts"

let SERVER: Bun.Server<undefined> | null = null

const logo = async (): Promise<void> => {
  if (Bun.env.LOGO_SERVER) {
    SERVER = Bun.serve({
      port: Bun.env.LOGO_PORT ?? 8001,
      fetch(request: Request): Response {
        if (new URL(request.url).pathname === "/dropzone.png") {
          return new Response(Bun.file("./utils/dropzone.png"))
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
