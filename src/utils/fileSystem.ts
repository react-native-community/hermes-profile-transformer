import { promises } from 'fs';

export const readFile = async (path: string): Promise<any> => {
  try {
    const fileString: string = await promises.readFile(path, 'utf-8');
    if (fileString.length === 0) {
      throw new Error(`${path} is an empty file`);
    }
    const obj = JSON.parse(fileString);
    return obj;
  } catch (err) {
    throw err;
  }
};
