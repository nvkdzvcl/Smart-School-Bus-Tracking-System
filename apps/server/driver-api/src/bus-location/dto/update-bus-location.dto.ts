import { PartialType } from '@nestjs/mapped-types';
import { CreateBusLocationDto } from './create-bus-location.dto';

export class UpdateBusLocationDto extends PartialType(CreateBusLocationDto) {}
