import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AssembliesModule } from './assemblies/assemblies.module';
import { AssemblyTemplatesModule } from './assembly-templates/assembly-templates.module';
import { ClientsModule } from './clients/clients.module';
import { PrismaModule } from './prisma/prisma.module';
import { RawMaterialBatchesModule } from './raw-material-batches/raw-material-batches.module';
import { RawMaterialsModule } from './raw-materials/raw-materials.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    PrismaModule,
    RawMaterialsModule,
    RawMaterialBatchesModule,
    AssemblyTemplatesModule,
    AssembliesModule,
    SalesModule,
    ClientsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
