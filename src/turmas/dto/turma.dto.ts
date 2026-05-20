import { IsString, IsArray, IsDateString, IsOptional, IsMongoId } from 'class-validator';

export class CriarTurmaDto {
  @IsMongoId({ message: 'o ID do professor fornecido é inválido.' })
  professorId: string;

  @IsArray()
  @IsString({ each: true })
  diasAula: string[];

  @IsString()
  horario: string;

  @IsString()
  livroModulo: string;

  // O IsDateString garante que o frontend mande algo como '2026-08-01T00:00:00.000Z'
  @IsDateString()
  dataInicio: string;

  @IsDateString()
  dataFim: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true }) // Garante que a lista contenha apenas IDs válidos do MongoDB
  alunos?: string[];
}
