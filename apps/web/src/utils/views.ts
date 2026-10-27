import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// The package is ESM ("type": "module"), so __dirname is not defined.
const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const VIEWS_PATH = path.resolve(path.join(currentDir, "..", "views"));
export const viewPathExistOrthrow = async (): Promise<boolean> => {
  let result = false;
  try {
    result = (await stat(VIEWS_PATH)).isDirectory();
  } catch {
    result = false;
  }
  if (!result) throw new Error(`View path does not exist: ${VIEWS_PATH}`);

  return result;
};
export const loadView = async (viewPath: string) => {
  await viewPathExistOrthrow();
  const content = await readFile(path.join(VIEWS_PATH, `${viewPath}.html`), "utf-8");

  return content;
};
