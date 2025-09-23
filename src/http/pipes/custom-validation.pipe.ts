import { ValidationError, ValidationPipe } from '@nestjs/common';
import { CustomBadRequestException } from '~src/http/filter/http-exceptions.type';

export const customValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors: ValidationError[]) => {
    const validationErrors = flattenValidationErrors(errors);

    return new CustomBadRequestException(validationErrors, 'VLD-ERR');
  }
});

export function flattenValidationErrors(errors: ValidationError[], parentPath = ''): string[] {
  const result: string[] = [];

  for (const err of errors) {
    // В err.property лежит либо имя поля (например "goods"), либо индекс строки массива (если это вложенный элемент)
    // Делаем “новый путь”: если уже есть parentPath, добавляем точку, иначе просто err.property
    const currentPath = parentPath ? `${parentPath}.${err.property}` : err.property;

    // Если есть “constraints”, значит в этом узле лежат конкретные сообщения
    if (err.constraints) {
      for (const constraintMsg of Object.values(err.constraints)) {
        // Формируем сообщение вида "goods.1.price: price must not be less than 0"
        result.push(`${currentPath}: ${constraintMsg}`);
      }
    }

    // Если есть дети (“children”), спускаемся вниз
    if (err.children && err.children.length > 0) {
      // У детей property будет либо индекс (для массивов), либо имя поля (для вложенных объектов)
      const childMessages = flattenValidationErrors(err.children, currentPath);
      result.push(...childMessages);
    }
  }

  return result;
}
