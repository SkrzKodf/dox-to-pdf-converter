import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  StreamableFile
} from '@nestjs/common';
import { ApiCommonResponses } from '~src/http/decorators/api-response.decorator';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConvertHttpService } from '~src/http/modules/convert-http/convert-http.service';
import express from 'express';
import { ConvertUniversalDto } from './dto/convert-universal.dto';

@ApiTags('Конвертация Doc в Pdf')
@ApiCommonResponses()
@Controller('convert')
export class ConvertHttpController {
  constructor(private readonly convertService: ConvertHttpService) {}

  @Post()
  @HttpCode(200)
  @ApiResponse({
    status: 200,
    description: 'Конвертированный файл в бинарном формате',
    content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } }
  })
  async convert(
    @Body() body: ConvertUniversalDto,
    @Res({ passthrough: true }) res: express.Response
  ): Promise<StreamableFile> {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="res.pdf"`);
    return new StreamableFile(await this.convertService.convert(body));
  }
}
