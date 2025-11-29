// apps/driver-api/src/reports/reports.controller.ts
import {
  Controller, Post, Get, Body, Req, UseInterceptors, UploadedFile,
  UseGuards, BadRequestException, ValidationPipe, Param,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiOkResponse, } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';


const ApiFile = (fileName = 'image'): MethodDecorator => (target: any, key, desc) => {
  ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'content', 'type'],
      properties: {
        title: { type: 'string' },
        content: { type: 'string' },
        type: { type: 'string', enum: ['student_absent', 'incident', 'complaint', 'other'] },
        studentId: { type: 'string', format: 'uuid' },
        [fileName]: { type: 'string', format: 'binary' },
      },
    },
  })(target, key as any, desc);
};

function ensureDir(dir: string) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

// DÙNG __dirname để không lệch thư mục
const PUBLIC_DIR = join(__dirname, '..', '..', 'public');
const UPLOAD_DIR = join(PUBLIC_DIR, 'uploads', 'incidents');

function filenameFn(req, file, cb) {
  // Nếu muốn giữ nguyên tên: const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
  const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
  cb(null, unique + extname(file.originalname).toLowerCase());
}

@ApiTags('Reports (Driver)')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy lịch sử báo cáo của tài xế' })
  async list(@Req() req: any) {
    const driverId = req.user.userId;
    return this.reportsService.findAllByDriver(driverId);
  }

  @Post()
  @ApiOperation({ summary: 'Gửi báo cáo (kèm ảnh tuỳ chọn)' })
  @ApiConsumes('multipart/form-data')
  @ApiFile('image')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        ensureDir(UPLOAD_DIR);
        cb(null, UPLOAD_DIR);
      },
      filename: filenameFn,
    }),
    limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      if (!file) return cb(null, true);
      if (file.mimetype?.startsWith('image/')) return cb(null, true);
      return cb(new BadRequestException('File phải là ảnh'), false);
    },
  }))
  async create(
    @Req() req: any,
    @Body(new ValidationPipe()) dto: CreateReportDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const driverId = req.user.userId;

    // Base URL public
    const port = Number(process.env.PORT) || 3000;
    const baseUrl = process.env.APP_PUBLIC_URL || `http://localhost:${port}`;

    // NẾU có file, trả URL public => http://localhost:3000/static/uploads/incidents/<tên-file>
    const imageUrl = file ? `${baseUrl}/static/uploads/incidents/${file.filename}` : undefined;

    // DEBUG: kiểm tra bạn có nhận được file không
    console.log('[reports.create] file?', !!file, file?.path, '→', imageUrl);

    const result = await this.reportsService.create(driverId, dto, imageUrl);
    return result;
  }

  @Get('by-trip/:tripId')
  @ApiOperation({ summary: 'Lấy chi tiết báo cáo theo ID chuyến đi' })
  @ApiOkResponse({ description: 'Danh sách chi tiết các báo cáo' })
  async getReportsByTripId(@Param('tripId') tripId: string, @Req() req: any) {
    // Thêm kiểm tra bảo mật: chỉ tài xế sở hữu chuyến đi mới được xem
    // (Mình sẽ làm ở Service)
    const driverId = req.user.userId; 
    return this.reportsService.findByTripId(tripId, driverId);
  }
}
