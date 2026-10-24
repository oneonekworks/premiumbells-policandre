export const PROJECT_PAGE_SIZE = 24;

export function pageNumber(value: string | string[] | undefined): number {
  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) return 1;
  const number = Number(value);
  return Number.isSafeInteger(number) && number <= 10000 ? number : 1;
}
