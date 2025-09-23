import { Injectable } from '@nestjs/common';
import { convert } from 'libreoffice-convert';
import { Trace } from '~src/telemetry/trace/decorators/trace.decorator';
import { DoxReplacer } from './dox-replacer.service';
import { join } from 'path';
import { readFileSync } from 'node:fs';

@Injectable()
export class ConvertHttpService {
  constructor(private readonly doxReplacer: DoxReplacer) {}

  @Trace('DoxToPdfConverter.convert')
  convert(body: any): Promise<Buffer> {
    const path = join(process.cwd(), `/templates/template.docx`);
    const bytes = readFileSync(path);

    const buffer = this.doxReplacer.fillTemplate(bytes, body.data);

    return new Promise((resolve, reject) => {
      convert(buffer, '.pdf', undefined, (err, pdfBuf) => {
        if (err) return reject(err);
        resolve(pdfBuf);
      });
    });
  }
}
