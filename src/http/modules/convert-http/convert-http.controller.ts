import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Res,
  StreamableFile,
  UploadedFiles,
  UseInterceptors
} from '@nestjs/common';
import { ApiCommonResponses } from '~src/http/decorators/api-response.decorator';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConvertHttpService } from '~src/http/modules/convert-http/convert-http.service';
import express from 'express';
import { ConvertUniversalDto } from './dto/convert-universal.dto';
import { AnyFilesInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@ApiTags('Конвертация Doc в Pdf')
@ApiCommonResponses()
@Controller('convert')
export class ConvertHttpController {
  constructor(private readonly convertService: ConvertHttpService) {}

  @Post()
  // @UseInterceptors(NoFilesInterceptor())
  // @HttpCode(200)
  // @ApiResponse({
  //   status: 200,
  //   description: 'Конвертированный файл в бинарном формате',
  //   content: { 'application/octet-stream': { schema: { type: 'string', format: 'binary' } } }
  // })
  async convert(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
    @Res({ passthrough: true }) res: express.Response
  ): Promise<StreamableFile> {
    let map = new Map();
    map.set(1, 'Января');
    map.set(2, 'Февраля');
    map.set(3, 'Марта');
    map.set(4, 'Апреля');
    map.set(5, 'Мая');
    map.set(6, 'Июня');
    map.set(7, 'Июля');
    map.set(8, 'Августа');
    map.set(9, 'Сентября');
    map.set(10, 'Октября');
    map.set(11, 'Ноября');
    map.set(12, 'Декабря');

    body.issueDate =
      '«' +
      body.issueDate.split('.')[0] +
      '» ' +
      map.get(Number(body.issueDate.split('.')[1])) +
      ' ' +
      body.issueDate.split('.')[2];

    body.picsDescription = body.picsDescription.split('|||');
    body.picsDescription.pop();

    for (let i = 0; i < body.picsDescription.length; i++) {
      let a: number = i + 1;
      let b: string = 'Приложение ' + a + '; ';
      body.picsDescription[i] = {
        picDesc: body.picsDescription[i],
        pic: files[i],
        picPril: b
      };
    }
    console.log(body);
    console.log(files);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="res.pdf"`);
    return new StreamableFile(await this.convertService.convert(body));
  }
}
