import { Module } from '@nestjs/common';

import { AssemblyTemplatesController } from './assembly-templates.controller';
import { AssemblyTemplatesService } from './assembly-templates.service';

@Module({
  controllers: [AssemblyTemplatesController],
  providers: [AssemblyTemplatesService],
  exports: [AssemblyTemplatesService],
})
export class AssemblyTemplatesModule {}
