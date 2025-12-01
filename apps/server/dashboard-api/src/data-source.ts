import 'reflect-metadata'
import { DataSource } from 'typeorm'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.join(process.cwd(), '.env') })

export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [path.join(process.cwd(), 'src', '**', '*.entity.{ts,js}')],
    migrations: [path.join(process.cwd(), 'src', 'migrations', '*.{ts,js}')],
    synchronize: false,
    logging: false,
})
