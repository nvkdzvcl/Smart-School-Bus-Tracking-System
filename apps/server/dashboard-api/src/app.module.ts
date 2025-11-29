import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { BusesModule } from './buses/buses.module'
import { StopsModule } from './stops/stops.module'
import { RoutesModule } from './routes/routes.module'
import { StudentsModule } from './students/students.module'
import { TripsModule } from './trips/trips.module'
import { NotificationsModule } from './notifications/notifications.module'
import { MessagesModule } from './messages/messages.module'
import { ReportsModule } from './reports/reports.module'
import { BusLocationsModule } from './bus-locations/bus-locations.module'
import { UsersModule } from './user/users.module'
import { ConversationsModule } from './conversations/conversations.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.getOrThrow<string>('DB_HOST'),
                port: config.getOrThrow<number>('DB_PORT'),
                username: config.getOrThrow<string>('DB_USER'),
                password: config.getOrThrow<string>('DB_PASS'),
                database: config.getOrThrow<string>('DB_NAME'),
                autoLoadEntities: true,
                synchronize: false,
            }),
        }),
        AuthModule,
        BusesModule,
        StopsModule,
        RoutesModule,
        StudentsModule,
        TripsModule,
        NotificationsModule,
        MessagesModule,
        ReportsModule,
        BusLocationsModule,
        UsersModule,
        ConversationsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule { }
