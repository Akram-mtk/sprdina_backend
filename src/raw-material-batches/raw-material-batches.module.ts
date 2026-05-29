import { Module } from '@nestjs/common';

import { RawMaterialBatchesController } from './raw-material-batches.controller';
import { RawMaterialBatchesService } from './raw-material-batches.service';

@Module({
  controllers: [RawMaterialBatchesController],
  providers: [RawMaterialBatchesService],
})
export class RawMaterialBatchesModule {}
