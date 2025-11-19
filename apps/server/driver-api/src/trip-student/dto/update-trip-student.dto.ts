import { PartialType } from '@nestjs/mapped-types';
import { CreateTripStudentDto } from './create-trip-student.dto';

export class UpdateTripStudentDto extends PartialType(CreateTripStudentDto) {}
