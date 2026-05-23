import { Injectable } from '@nestjs/common';
import { PartesReclamos } from 'src/generated/prisma/client';
import { PartesReclamoDTO } from 'src/partes-reclamos/partes-reclamo.dto';

@Injectable()
export class PartesReclamosExtensions {
  constructor(private readonly data: PartesReclamos) {}

  updateWith(parte: PartesReclamoDTO): PartesReclamos {
    this.data.incomparendo = parte.incomparendo || false;
    this.data.multado = parte.multado || false;
    this.data.nroWhatsappParte = parte.nroWhatsappParte || null;
    this.data.nroWhatsappPatrocinante = parte.nroWhatsappPatrocinante || null;
    this.data.postergo = parte.postergo || false;
    return this.data;
  }
}
