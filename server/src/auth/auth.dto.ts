import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);
const lower = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim().toLowerCase() : value);

/** Sri Lankan mobile/landline (07X XXX XXXX, +94…) or any international number of 9–15 digits. */
export const PHONE_PATTERN = /^\+?[0-9][0-9 ()-]{7,18}[0-9]$/;
/** At least one letter and one number. */
export const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

export class LoginDto {
  @Transform(lower)
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254)
  email!: string;

  @IsString()
  @MinLength(1, { message: 'Enter your password.' })
  @MaxLength(128)
  password!: string;
}

export class RegisterDto {
  @Transform(trim)
  @IsString()
  @Length(2, 80, { message: 'Name must be 2 to 80 characters.' })
  @Matches(/^[\p{L}][\p{L} .'-]*$/u, { message: 'Name can only contain letters, spaces, dots, apostrophes and hyphens.' })
  name!: string;

  @Transform(lower)
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254)
  email!: string;

  @Transform(trim)
  @Matches(PHONE_PATTERN, { message: 'Enter a valid phone number, for example 077 123 4567.' })
  phone!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72, { message: 'Password must be 72 characters or fewer.' })
  @Matches(PASSWORD_PATTERN, { message: 'Password must contain at least one letter and one number.' })
  password!: string;
}

export class UpdateProfileDto {
  @Transform(trim)
  @IsString()
  @Length(2, 80, { message: 'Name must be 2 to 80 characters.' })
  @Matches(/^[\p{L}][\p{L} .'-]*$/u, { message: 'Name can only contain letters, spaces, dots, apostrophes and hyphens.' })
  name!: string;

  @Transform(trim)
  @Matches(PHONE_PATTERN, { message: 'Enter a valid phone number, for example 077 123 4567.' })
  phone!: string;
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'Enter your current password.' })
  @MaxLength(128)
  currentPassword!: string;

  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters.' })
  @MaxLength(72, { message: 'New password must be 72 characters or fewer.' })
  @Matches(PASSWORD_PATTERN, { message: 'New password must contain at least one letter and one number.' })
  newPassword!: string;
}

export class ForgotPasswordDto {
  @Transform(lower)
  @IsEmail({}, { message: 'Enter a valid email address.' })
  @MaxLength(254)
  email!: string;
}

export class ResetPasswordDto {
  @IsString()
  @Length(20, 100, { message: 'This reset link is not valid. Please request a new one.' })
  token!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters.' })
  @MaxLength(72, { message: 'Password must be 72 characters or fewer.' })
  @Matches(PASSWORD_PATTERN, { message: 'Password must contain at least one letter and one number.' })
  password!: string;
}
