import {
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';
import * as moment from 'moment-timezone';

@ValidatorConstraint({ name: 'NotBackDateTime', async: false })
export class NotBackDateTimeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    if (typeof value !== 'string') {
      return false;
    }

    const [format] = args.constraints;
    return moment(value).format(format) >= moment().local().format(format);
  }

  defaultMessage(args: ValidationArguments) {
    return `${args.property} value is less than current date.`;
  }
}

export function NotBackDateTime(
  format: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [format],
      validator: NotBackDateTimeConstraint,
    });
  };
}
