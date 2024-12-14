import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacheModule } from '@nestjs/cache-manager';
import { MoviesModule } from './movies/movies.module';
import { TvshowsModule } from './tvshows/tvshows.module';
import { ListModule } from './list/list.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/stagedb'),
    CacheModule.register({
      isGlobal: true,
      ttl: 60, // cache for 1 minute
      max: 100, // maximum number of items in cache
    }),
    MoviesModule,
    TvshowsModule,
    ListModule,
  ],
})
export class AppModule {}
