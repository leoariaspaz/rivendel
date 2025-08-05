import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Response } from 'express';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const message = this.mapPrismaErrorToMessage(exception);

    console.log('Prisma Exception Filter caught an error: ', exception);

    response.status(HttpStatus.BAD_REQUEST).json({
      code: exception.code,
      message: message,
    });
  }

  mapPrismaErrorToMessage(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2000':
        return 'El valor proporcionado es demasiado largo para la columna de la base de datos.';
      case 'P2002':
        return 'Falló una restricción de unicidad. El dato ya existe.';
      case 'P2003':
        return 'Falló una restricción de clave foránea. Los datos relacionados no existen.';
      case 'P2004':
        return 'Falló una restricción de la base de datos.';
      case 'P2025':
        return 'La operación falló porque depende de uno o más registros requeridos que no se encontraron.';
      default:
        return 'Ocurrió un error desconocido en la base de datos.';
    }
  }
}
