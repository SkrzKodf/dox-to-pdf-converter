import { Module } from '@nestjs/common';
import { ConvertHttpService } from './convert-http.service';
import { ConvertHttpController } from './convert-http.controller';
import { DoxReplacer } from './dox-replacer.service';

@Module({
  providers: [ConvertHttpService, DoxReplacer],
  controllers: [ConvertHttpController]
})
export class ConvertHttpModule {}
