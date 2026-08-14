import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCropDto {
  @ApiProperty({
    example: 'SOYBEAN',
    description: 'Cultura plantada (ex.: SOYBEAN, CORN, COFFEE).',
  })
  @IsString()
  @IsNotEmpty()
  crop!: string;

  @ApiProperty({
    example: 'Safra 2024',
    description: 'Identificacao da safra.',
  })
  @IsString()
  @IsNotEmpty()
  harvest!: string;
}
