import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.setGlobalPrefix('api')
    app.enableCors()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidUnknownValues: false, transform: true }))

    const port = process.env.PORT || 3001
    await app.listen(port as number)
    console.log(`Dashboard API running on http://localhost:${port}`)
}
bootstrap()
