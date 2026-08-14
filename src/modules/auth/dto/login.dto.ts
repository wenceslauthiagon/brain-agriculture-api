import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'test-brain',
    description: 'Usuário para autenticação na aplicação.',
  })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({
    example: '123456',
    description: 'Senha para autenticação na aplicação.',
  })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
