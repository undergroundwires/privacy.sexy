import { IApplication } from '@/domain/IApplication';
import { ApplicationFactory } from '@/application/ApplicationFactory';

export async function dumpNames(): Promise<string> {
  const application = await ApplicationFactory.Current.getApp();
  const names = collectNames(application);
  const output = names.join('\n');
  return output;
}

function collectNames(application: IApplication): string[] {
  const { collections } = application;

  const allNames = [
    ...collections.flatMap((collection) => collection.getAllCategories().map((c) => c.name)),
    ...collections.flatMap((collection) => collection.getAllScripts().map((c) => c.name)),
  ];

  const uniqueNames = [...new Set(allNames)];

  return shuffle(uniqueNames);
}

/*
  Shuffle an array of strings, returning a new array with elements in random order.
  Uses the Fisher-Yates (or Durstenfeld) algorithm.
*/
function shuffle(array: readonly string[]): string[] {
  const shuffledArray = [...array];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}
