import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateProducerDto {
  @ApiProperty({
    example: '12345678909',
    description: 'CPF ou CNPJ do produtor (apenas numeros ou formatado).',
  })
  @IsString()
  @IsNotEmpty()
  document!: string;

  @ApiProperty({
    example: 'Joao da Silva',
    description: 'Nome do produtor rural.',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
