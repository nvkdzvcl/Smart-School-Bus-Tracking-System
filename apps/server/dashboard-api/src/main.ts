import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.setGlobalPrefix('api')
    app.enableCors({ origin: ['http://localhost:3002', 'http://localhost:3000'], credentials: true })
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidUnknownValues: false, transform: true }))
    const port = Number(process.env.PORT) || 3001
    await app.listen(port)
    console.log(`Dashboard API running on http://localhost:${port}`)
}
bootstrap()
