import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { User, UserDocument } from '../models/user.schema';
import { Movie, MovieDocument } from '../models/movie.schema';
import { TVShow, TVShowDocument } from '../models/tvshow.schema';
import { AddToListDto, ContentType } from './dto/add-to-list.dto';
import { ListQueryDto } from './dto/list-query.dto';

@Injectable()
export class ListService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Movie.name) private readonly movieModel: Model<MovieDocument>,
    @InjectModel(TVShow.name)
    private readonly tvShowModel: Model<TVShowDocument>,
  ) {}

  private async findUserById(userId: string): Promise<UserDocument> {
    const user = await this.userModel
      .findById(new Types.ObjectId(userId))
      .lean();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  private async findContentById(
    contentId: string,
    model: Model<MovieDocument | TVShowDocument>,
  ): Promise<MovieDocument | TVShowDocument | null> {
    return model.findById(new Types.ObjectId(contentId)).lean();
  }

  async addToList(userId: string, addToListDto: AddToListDto) {
    const user = await this.findUserById(userId);

    // Check if content exists
    const model =
      addToListDto.contentType === ContentType.Movie
        ? this.movieModel
        : this.tvShowModel;
    const content = await this.findContentById(addToListDto.contentId, model);
    if (!content) {
      throw new NotFoundException(`${addToListDto.contentType} not found`);
    }

    // Check if content is already in list
    const existingItem = user.myList.find(
      (item) => item.contentId === addToListDto.contentId,
    );
    if (existingItem) {
      throw new ConflictException('Content already in list');
    }

    // Add to list
    await this.userModel.findByIdAndUpdate(
      user._id,
      {
        $push: {
          myList: {
            contentId: addToListDto.contentId,
            contentType: addToListDto.contentType,
          },
        },
      },
      { new: true },
    );

    return { message: 'Content added to list successfully' };
  }

  async removeFromList(userId: string, contentId: string) {
    const user = await this.findUserById(userId);

    const result = await this.userModel.updateOne(
      { _id: user._id },
      { $pull: { myList: { contentId } } },
    );

    if (result.modifiedCount === 0) {
      throw new NotFoundException('Content not found in list');
    }

    return { message: 'Content removed from list successfully' };
  }

  async listMyItems(userId: string, query: ListQueryDto) {
    const user = await this.findUserById(userId);

    const { limit = 10, offset = 0 } = query;
    const totalItems = user.myList.length;
    const paginatedItems = user.myList.slice(offset, offset + limit);

    // Fetch content details for each item
    const contentDetails = await Promise.all(
      paginatedItems.map(async (item) => {
        const model =
          item.contentType === ContentType.Movie
            ? this.movieModel
            : this.tvShowModel;
        const content = await this.findContentById(item.contentId, model);

        if (!content) {
          return {
            id: item.contentId,
            type: item.contentType,
            error: 'Content not found',
          };
        }

        return {
          id: item.contentId,
          type: item.contentType,
          title: content.title,
          description: content.description,
          genres: content.genres,
        };
      }),
    );

    return {
      items: contentDetails.filter((item) => !item.error),
      removedItems: contentDetails.filter((item) => item.error),
      pagination: {
        total: totalItems,
        offset,
        limit,
        remaining: Math.max(0, totalItems - (offset + limit)),
      },
    };
  }
}
