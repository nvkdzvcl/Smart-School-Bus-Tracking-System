// apps/driver-api/src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth/auth.module';
import { ScheduleModule } from './schedule/schedule.module'; // <-- Đã thêm
import { NotificationModule } from './notification/notification.module';
import { ReportsModule } from './reports/reports.module';
import { TripStudentModule } from './trip-student/trip-student.module';
import { UsersModule } from './user/users.module';
import { MessagesModule } from './messages/messages.module';
import { ConversationsModule } from './conversations/conversations.module';
import { StopsModule } from './stops/stops.module';
import { TripModule } from './trip/trip.module';
import { StudentModule } from './student/student.module';
import { ProfileModule } from './profile/profile.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.getOrThrow<string>('DB_HOST'),
        port: configService.getOrThrow<number>('DB_PORT'),
        username: configService.getOrThrow<string>('DB_USER'),
        password: configService.getOrThrow<string>('DB_PASS'),
        database: configService.getOrThrow<string>('DB_NAME'),
        autoLoadEntities: true, // Tự động load các Entity mới
        synchronize: false, // Để false cho an toàn
        entities: ['../typeorm/entities/*.ts'],
      }),
    }),

    AuthModule,
    ScheduleModule,
    NotificationModule,
    ReportsModule,
    TripStudentModule,
    UsersModule,
    MessagesModule,
    ConversationsModule,
    StopsModule,
    TripModule,
    StudentModule,
    ProfileModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
