import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsNumber, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

/** A bundled photo (images/…), an uploaded one (/api/images/<id>) or an https link. */
export const IMAGE_PATTERN = /^(images\/[\w.-]+|\/api\/images\/[0-9a-f-]{36}|https:\/\/\S+)$/;

export class ProductDto {
  @Transform(trim)
  @IsString()
  @Length(2, 60, { message: 'Drink name must be 2 to 60 characters.' })
  name!: string;

  @Transform(trim)
  @IsString()
  @MaxLength(200, { message: 'Description must be 200 characters or fewer.' })
  description!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with at most 2 decimals.' })
  @Min(0.01, { message: 'Price must be more than 0.' })
  @Max(100_000, { message: 'Price is too high.' })
  price!: number;

  @IsIn(['hot', 'cold', 'beans'], { message: 'Choose Hot, Cold or Beans.' })
  category!: 'hot' | 'cold' | 'beans';

  @Transform(trim)
  @IsString()
  @MaxLength(500)
  @Matches(IMAGE_PATTERN, { message: 'Upload a photo or use an https image link.' })
  image!: string;

  @IsBoolean()
  available!: boolean;

  @IsBoolean()
  featured!: boolean;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(999)
  sortOrder!: number;
}
