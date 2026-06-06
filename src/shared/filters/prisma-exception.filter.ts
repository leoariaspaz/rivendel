import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
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

  mapPrismaErrorToMessage(error: Prisma.PrismaClientKnownRequestError): string {
    const target = Array.isArray(error.meta?.target)
      ? error.meta.target.join(', ')
      : (error.meta?.target as string) || '';

    const fieldName = (error.meta?.field_name as string) || '';
    const modelName = (error.meta?.modelName as string) || 'el registro';

    switch (error.code) {
      case 'P2000':
        return `El valor proporcionado excede el límite de caracteres permitido para el campo o columna.`;

      case 'P2002':
        return target
          ? `Ya existe un registro con el/los campo(s): [${target}] duplicado(s).`
          : `Conflicto: Ya existe un registro con los valores únicos proporcionados.`;

      case 'P2003': {
        const relacion = fieldName.split('_fkey')[0] || fieldName;
        return `No se puede guardar el registro porque la referencia o relación (${relacion}) proporcionada no existe.`;
      }
      case 'P2004':
        return `La operación no cumple con las reglas de validación de la base de datos.`;

      case 'P2025':
        return `Operación fallida: No se encontró ${modelName} con los identificadores proporcionados.`;

      default: {
        // loggear el error completo para análisis posterior
        console.error('Error de Prisma no manejado:', error);
        return 'No se pudo procesar la solicitud debido a un error interno en el servidor de datos.';
      }
    }
  }
}
