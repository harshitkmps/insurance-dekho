import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    console.log('errors', JSON.stringify(errors));
    if (errors.length > 0) {
      const buildedErrors = this.buildErrors(errors[0]);
      throw new BadRequestException({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        validationsFailed: errors[0].constraints,
        error: 'Bad Request',
        errors: buildedErrors,
      });
    }
    return value;
  }
  private toValidate(metatype): boolean {
    const types = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private buildErrors(error): any {
    const constraints = Object.entries(error.constraints).reduce(
      (constraintsAcc, [key, value]) => {
        if (
          error.contexts &&
          error.contexts[key] &&
          error.contexts[key].errorCode
        )
          constraintsAcc[error.contexts[key].errorCode] = value;
        else constraintsAcc[key] = value;
        return constraintsAcc;
      },
      {},
    );
    return constraints;
  }
}
