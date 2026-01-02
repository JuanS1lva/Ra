import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
