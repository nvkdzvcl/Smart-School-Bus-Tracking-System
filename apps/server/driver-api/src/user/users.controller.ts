import { Body, Controller, Get, Param, Put, Query, Req } from '@nestjs/common';
import { User } from './user.entity';
import { UpdateParentDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('students/:studentId/current-trip')
  getCurrentTripForStudent(@Param('studentId') studentId: string, @Req() req) {
    return this.userService.getCurrentTripForStudent(studentId);
  }

  @Get('search')
  async searchUsers(@Query('q') query: string) {
    return this.userService.searchUsersToChat(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateParentDto,
  ): Promise<User | null> {
    return await this.userService.updateParentInfo(id, dto);
  }
}
