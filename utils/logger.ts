import { format } from "date-and-time"
import { bgBlue, bgRed, cyan, red, white } from "recolors"

const getTime = (): string => {
  return cyan(" [") + white(format(new Date(), "MM/DD/YYYY @ HH:mm:ss")) + cyan("] ")
}

const error = (...objs: unknown[]): void => {
  if (!objs.length) {
    return
  }

  console.error(bgRed(white(" ERROR ")) + getTime())
  objs.forEach((obj: unknown): void => console.error(red(" ⤷"), obj))
}

const info = (...objs: unknown[]): void => {
  if (!objs.length) {
    return
  }

  console.info(bgBlue(white(" INFO ")) + getTime())
  objs.forEach((obj: unknown): void => console.info(cyan(" ⤷"), obj))
}

export { error, info }
