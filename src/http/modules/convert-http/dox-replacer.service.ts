import { Injectable } from '@nestjs/common';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Trace } from '~src/telemetry/trace/decorators/trace.decorator';

@Injectable()
export class DoxReplacer {
  @Trace('DoxReplacer.fillTemplate', { root: false }, { logOutput: true, logInput: true })
  fillTemplate(content: Buffer, data: object): Buffer {
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(data);
    return doc.getZip().generate({ type: 'nodebuffer' });
  }
}