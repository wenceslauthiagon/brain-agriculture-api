import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProducerDto {
  @ApiProperty({
    example: 'Joao da Silva',
    description: 'Nome do produtor rural.',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}
