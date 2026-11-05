import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsEmail, IsIn, IsInt, IsNumber, IsOptional, IsString, Length, Matches, Max, MaxLength, Min, ValidateNested } from 'class-validator';
import { PHONE_PATTERN } from '../auth/auth.dto.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const text = (min: number, max: number, label: string) => Length(min, max, { message: `${label} must be ${min} to ${max} characters.` });

class HeroDto {
  @Transform(trim) @IsString() @text(1, 80, 'Hero small heading') eyebrow!: string;
  @Transform(trim) @IsString() @text(1, 40, 'Hero title line 1') titleLine1!: string;
  @Transform(trim) @IsString() @text(1, 40, 'Hero title line 2') titleLine2!: string;
  @Transform(trim) @IsString() @text(10, 300, 'Hero text') text!: string;
}
class FeatureDto {
  @IsIn(['bean', 'leaf', 'truck', 'shield'], { message: 'Choose a valid icon.' }) icon!: string;
  @Transform(trim) @IsString() @text(1, 40, 'Feature title') title!: string;
  @Transform(trim) @IsString() @text(1, 120, 'Feature text') text!: string;
}
class SectionDto {
  @Transform(trim) @IsString() @text(1, 60, 'Small heading') eyebrow!: string;
  @Transform(trim) @IsString() @text(1, 60, 'Title') title!: string;
  @Transform(trim) @IsString() @text(1, 400, 'Text') text!: string;
}
class StoryDto extends SectionDto {
  @Transform(trim) @IsString() @text(1, 60, 'Story tagline') tagline!: string;
}
class StatDto {
  @Type(() => Number) @IsNumber({}, { message: 'Stat value must be a number.' }) @Min(0) @Max(1_000_000) value!: number;
  @Transform(trim) @IsString() @MaxLength(4, { message: 'Stat suffix must be 4 characters or fewer.' }) suffix!: string;
  @Transform(trim) @IsString() @text(1, 40, 'Stat label') label!: string;
  @Type(() => Number) @IsInt() @Min(0) @Max(2) decimals!: number;
}
class CtaDto {
  @Transform(trim) @IsString() @text(1, 80, 'Call-to-action small heading') eyebrow!: string;
  @Transform(trim) @IsString() @text(1, 60, 'Call-to-action title') title!: string;
}
class ContactDto {
  @Transform(trim) @Matches(PHONE_PATTERN, { message: 'Enter a valid contact phone number.' }) phone!: string;
  @Transform(trim) @IsEmail({}, { message: 'Enter a valid contact email.' }) @MaxLength(254) email!: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(160, { message: 'Address must be 160 characters or fewer.' }) address!: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(120, { message: 'Opening hours must be 120 characters or fewer.' }) hours!: string;
}

export class SiteContentDto {
  @Transform(trim) @IsString() @text(1, 4, 'Currency symbol') currency!: string;
  @ValidateNested() @Type(() => HeroDto) hero!: HeroDto;
  @ValidateNested({ each: true }) @Type(() => FeatureDto) @ArrayMinSize(4) @ArrayMaxSize(4) features!: FeatureDto[];
  @ValidateNested() @Type(() => SectionDto) menu!: SectionDto;
  @ValidateNested() @Type(() => StoryDto) story!: StoryDto;
  @ValidateNested({ each: true }) @Type(() => StatDto) @ArrayMinSize(4) @ArrayMaxSize(4) stats!: StatDto[];
  @ValidateNested() @Type(() => CtaDto) cta!: CtaDto;
  @ValidateNested() @Type(() => ContactDto) contact!: ContactDto;
}
