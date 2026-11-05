import { Transform, Type } from 'class-transformer';
import { IsEmail, IsIn, IsInt, IsOptional, IsString, Length, Matches, Max, MaxLength, Min } from 'class-validator';
import { PHONE_PATTERN } from '../auth/auth.dto.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

export class ReservationDto {
  @Transform(trim)
  @IsString()
  @Length(2, 80, { message: 'Name must be 2 to 80 characters.' })
  @Matches(/^[\p{L}][\p{L} .'-]*$/u, { message: 'Name can only contain letters, spaces, dots, apostrophes and hyphens.' })
  name!: string;

  @Transform(trim)
  @Matches(PHONE_PATTERN, { message: 'Enter a valid phone number, for example 077 123 4567.' })
  phone!: string;

  @Transform(lower)
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254)
  email!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'Choose a date.' })
  date!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'Choose a time.' })
  time!: string;

  @Type(() => Number)
  @IsInt({ message: 'Choose the number of guests.' })
  @Min(1, { message: 'At least 1 guest.' })
  @Max(12, { message: 'For more than 12 guests, please call us.' })
  guests!: number;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300, { message: 'Note must be 300 characters or fewer.' })
  note?: string;
}

export class ReservationStatusDto {
  @IsIn(['requested', 'confirmed', 'declined', 'cancelled'], { message: 'Choose a valid status.' })
  status!: 'requested' | 'confirmed' | 'declined' | 'cancelled';
}

export class SubscribeDto {
  @Transform(lower)
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254)
  email!: string;
}
