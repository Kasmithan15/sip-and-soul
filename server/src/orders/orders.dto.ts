import { Transform, Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsIn, IsInt, IsOptional, IsString, IsUUID, Length, Matches, Max, MaxLength, Min, ValidateIf, ValidateNested } from 'class-validator';
import { PHONE_PATTERN } from '../auth/auth.dto.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

class OrderItemDto {
  @IsUUID('4', { message: 'One of the drinks in your cart is not valid.' })
  productId!: string;

  @Type(() => Number)
  @IsInt({ message: 'Quantity must be a whole number.' })
  @Min(1, { message: 'Quantity must be at least 1.' })
  @Max(20, { message: 'You can order up to 20 of one drink.' })
  quantity!: number;
}

export class CreateOrderDto {
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  @ArrayMinSize(1, { message: 'Your cart is empty.' })
  @ArrayMaxSize(30, { message: 'Too many different drinks in one order.' })
  items!: OrderItemDto[];

  @IsIn(['pickup', 'delivery'], { message: 'Choose pickup or delivery.' })
  type!: 'pickup' | 'delivery';

  @Transform(trim)
  @Matches(PHONE_PATTERN, { message: 'Enter a valid phone number, for example 077 123 4567.' })
  phone!: string;

  @ValidateIf((o: CreateOrderDto) => o.type === 'delivery')
  @Transform(trim)
  @IsString()
  @Length(10, 200, { message: 'Enter your full delivery address (10 to 200 characters).' })
  address!: string;

  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(300, { message: 'Note must be 300 characters or fewer.' })
  note?: string;
}

export const ORDER_STATUSES = ['pending', 'preparing', 'ready', 'completed', 'cancelled'] as const;

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUSES, { message: 'Choose a valid order status.' })
  status!: (typeof ORDER_STATUSES)[number];
}
