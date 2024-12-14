import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ContentType {
  Movie = 'Movie',
  TVShow = 'TVShow',
}

export class AddToListDto {
  @ApiProperty({ description: 'ID of the content to add to list' })
  @IsNotEmpty()
  contentId: string;

  @ApiProperty({
    enum: ContentType,
    description: 'Type of content (Movie or TVShow)',
  })
  @IsEnum(ContentType)
  contentType: ContentType;
}
