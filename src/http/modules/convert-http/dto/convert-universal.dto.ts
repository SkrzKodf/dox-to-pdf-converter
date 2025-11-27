import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmptyObject } from 'class-validator';

export class ConvertUniversalDto {
  // @ApiProperty({
  //   description: 'Объект с полями',
  //   type: () => Object,
  //   required: true,
  //   nullable: false
  // })
  // @IsNotEmptyObject()
  data: any;
}
