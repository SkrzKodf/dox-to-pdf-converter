import { fakerRU as faker } from '@faker-js/faker';

const PHONE_EXAMPLE = faker.phone.number({ style: 'international' }).slice(1);
const FIRST_NAME_EXAMPLE = faker.person.firstName('male');
const MIDDLE_NAME_EXAMPLE = faker.person.middleName('male');
const LAST_NAME_EXAMPLE = faker.person.lastName('male');

export const examples = {
  PHONE_EXAMPLE,
  FIRST_NAME_EXAMPLE,
  MIDDLE_NAME_EXAMPLE,
  LAST_NAME_EXAMPLE
};
