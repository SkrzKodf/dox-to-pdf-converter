/**
 * Приостанавливает выполнение на указанное количество миллисекунд.
 * @param ms — задержка в миллисекундах.
 * @returns Promise, который разрешается спустя ms миллисекунд.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
