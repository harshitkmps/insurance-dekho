import { IsNotEmpty } from 'class-validator';

export class Participant {
  @IsNotEmpty()
  idValue: string;

  @IsNotEmpty()
  idType: string;
}
