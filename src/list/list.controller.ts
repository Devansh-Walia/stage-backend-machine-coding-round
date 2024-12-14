import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { UserService } from './list.servce';
import { AddToListDto } from './dto/add-to-list.dto';
import { ListQueryDto } from './dto/list-query.dto';

@ApiTags('My List')
@Controller('list')
export class ListController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: "Add content to user's list" })
  @ApiResponse({
    status: 201,
    description: 'Content added to list successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 409, description: 'Content already in list' })
  async addToList(@Body() addToListDto: AddToListDto) {
    // For demo purposes, using a hardcoded user ID. In a real app, this would come from auth
    const userId = 'demo-user';
    return this.userService.addToList(userId, addToListDto);
  }

  @Delete(':contentId')
  @ApiOperation({ summary: "Remove content from user's list" })
  @ApiResponse({
    status: 200,
    description: 'Content removed from list successfully',
  })
  @ApiResponse({ status: 404, description: 'Content not found in list' })
  async removeFromList(@Param('contentId') contentId: string) {
    // For demo purposes, using a hardcoded user ID. In a real app, this would come from auth
    const userId = 'demo-user';
    return this.userService.removeFromList(userId, contentId);
  }

  @Get()
  @ApiOperation({ summary: "Get user's list with pagination" })
  @ApiResponse({
    status: 200,
    description: 'Returns paginated list of content',
  })
  async getList(@Query() query: ListQueryDto) {
    // For demo purposes, using a hardcoded user ID. In a real app, this would come from auth
    const userId = 'demo-user';
    return this.userService.listMyItems(userId, query);
  }
}
