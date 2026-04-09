// biome-ignore-all lint/suspicious/noExplicitAny: can log anything

import { format } from "date-and-time";
import { bgBlue, bgRed, cyan, red, white } from "recolors";

const getTime = (): string => {
  return cyan(" [") + white(format(new Date(), "HH:mm:ss")) + cyan("] ");
};

const error = (...o: any[]): void => {
  if (!o.length) {
    return;
  }

  console.error(bgRed(white(" ERROR ")) + getTime());
  o.forEach((x: any) => console.error(red(" ⤷"), x));
};

const info = (...o: any[]): void => {
  if (!o.length) {
    return;
  }

  console.info(bgBlue(white(" INFO ")) + getTime());
  o.forEach((x: any) => console.info(cyan(" ⤷"), x));
};

export { error, info };
