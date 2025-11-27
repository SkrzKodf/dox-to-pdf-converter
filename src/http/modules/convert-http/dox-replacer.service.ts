import { Injectable } from '@nestjs/common';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { Trace } from '~src/telemetry/trace/decorators/trace.decorator';
import * as ImageModule from 'docxtemplater-image-module-free';
import { imageSize } from 'image-size';

type Pic = {
  fieldname: 'photo1';
  originalname: 'Elton_John_StillStanding.jpg';
  encoding: '7bit';
  mimetype: 'image/jpeg';
  buffer: Buffer;
  size: 18676;
};

type Data = {
  workIndex: '1';
  prescriptionText: 'Большой текст предписания ай ай ай айай йа йайа йа й ай айа';
  precriptionNumber: '132-23';
  issueDate: '«30» Сентября 2025';
  whomIssued: 'Гунько А.Д.';
  objectAdress: 'Жуковского 17';
  contractor: 'Цлав М.А.';
  picsDescription: [
    { picDesc: 'Эщкере'; pic: Pic; picPril: 'Приложение 1' },
    { picDesc: 'Эщкере'; pic: Pic; picPril: 'Приложение 2' }
  ];
};

@Injectable()
export class DoxReplacer {
  @Trace('DoxReplacer.fillTemplate', { root: false }, { logOutput: true, logInput: true })
  fillTemplate(content: Buffer, data: Data): Buffer {
    const zip = new PizZip(content);

    // ts-ignore
    var imageModule = new ImageModule(this.getOpts(data));

    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      modules: [imageModule]
    });

    const dataForRender = {
      workIndex: data.workIndex,
      prescriptionText: data.prescriptionText,
      precriptionNumber: data.precriptionNumber,
      issueDate: data.issueDate,
      whomIssued: data.whomIssued,
      objectAdress: data.objectAdress,
      contractor: data.contractor,
      picsDescription: data.picsDescription.map((e) => ({
        pic: e.pic.fieldname,
        picDesc: e.picDesc,
        picPril: e.picPril
      }))
    };

    doc.render(dataForRender);
    return doc.getZip().generate({ type: 'nodebuffer' });
  }

  private getOpts(data: Data) {
    var opts = {} as any;
    opts.centered = false;
    opts.fileType = 'docx';

    opts.getImage = function (tagValue: string, tagName: string) {
      console.log({ tagValue, tagName });

      const el = data.picsDescription.find((e) => e.pic.fieldname === tagValue);
      if (el) {
        return el.pic.buffer;
      }
      throw new Error(`Неизвестная картинка ${tagName}`);
    };

    opts.getSize = function (_img: unknown, _tagValue: string, _tagName: string) {
      const el = data.picsDescription.find((e) => e.pic.fieldname === _tagValue);

      if (el) {
        const size: { width: number; height: number } = imageSize(el.pic.buffer);
        const scale = size.width / 350;
        return [size.width / scale, size.height / scale];
      }
    };

    return opts;
  }
}
