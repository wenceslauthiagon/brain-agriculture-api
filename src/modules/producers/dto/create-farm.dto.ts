import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateCropDto } from './create-crop.dto';

export class CreateFarmDto {
  @ApiProperty({ example: 'Fazenda Primavera' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Sorriso' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'MT', description: 'Sigla do estado com 2 letras.' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 2)
  state!: string;

  @ApiProperty({ example: 1200.5, name: 'total_area' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total_area!: number;

  @ApiProperty({ example: 900.25, name: 'arable_area' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  arable_area!: number;

  @ApiProperty({ example: 300.25, name: 'vegetation_area' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  vegetation_area!: number;

  @ApiPropertyOptional({
    type: [CreateCropDto],
    example: [
      { crop: 'SOYBEAN', harvest: 'Safra 2024' },
      { crop: 'CORN', harvest: 'Safra 2024' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCropDto)
  crops?: CreateCropDto[];
}
