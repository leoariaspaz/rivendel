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
      message: [message],
      error: 'Bad Request',
      statusCode: HttpStatus.BAD_REQUEST,
    });
  }

  mapPrismaErrorToMessage(error: PrismaClientKnownRequestError): string {
    switch (error.code) {
      case 'P2000':
        return 'El valor proporcionado es demasiado largo para la columna de la base de datos.';
      case 'P2002':
        return 'Ya existe un registro con los valores únicos proporcionados.';
      case 'P2003':
        return 'Falló una restricción de clave foránea. Los datos relacionados no existen.';
      case 'P2004':
        return 'Falló una restricción de la base de datos.';
      case 'P2025':
        return 'El registro no existe.';
      default:
        return 'Ocurrió un error desconocido en la base de datos.';
    }
  }
}
