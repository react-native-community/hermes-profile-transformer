import fs from 'fs';
import { HermesCPUProfile } from '../types/hermesProfileInterfaces';

export const readData = (path: string): HermesCPUProfile => {
  try {
    const data: HermesCPUProfile = JSON.parse(fs.readFileSync(path, 'utf-8'));
    return data;
  } catch (err) {
    throw new Error(err);
  }
};
