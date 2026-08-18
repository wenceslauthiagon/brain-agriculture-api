import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token = '';

  @ApiProperty({ example: 'Bearer' })
  token_type = 'Bearer' as const;

  @ApiProperty({ example: '1h' })
  expires_in = '';
}
