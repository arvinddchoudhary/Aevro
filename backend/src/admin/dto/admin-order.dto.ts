import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const SUPPORTED_ORDER_STATUSES = Object.values(OrderStatus);
export const INVALID_ORDER_STATUS_MESSAGE = `Invalid order status. Supported statuses are: ${SUPPORTED_ORDER_STATUSES.join(', ')}`;

export enum AdminOrderSort {
  Newest = 'newest',
  Oldest = 'oldest',
}

export class ListAdminOrdersQueryDto {
  @Transform(({ value }) => Number(value ?? 1))
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Transform(({ value }) => Number(value ?? 20))
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;

  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(OrderStatus, { message: INVALID_ORDER_STATUS_MESSAGE })
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsEnum(AdminOrderSort)
  @IsOptional()
  sort?: AdminOrderSort = AdminOrderSort.Newest;
}

export class UpdateAdminOrderStatusDto {
  @IsEnum(OrderStatus, { message: INVALID_ORDER_STATUS_MESSAGE })
  status!: OrderStatus;
}
