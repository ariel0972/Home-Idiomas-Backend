import { IsString, IsEmail, MinLength, IsOptional, IsIn, IsMongoId } from 'class-validator';

export class RegistroDto {
  @IsString({ message: 'O nome deve ser um texto válido.' })
  @MinLength(3, { message: 'O nome precisa ter pelo menos 3 caracteres.' })
  nome: string;

  @IsEmail({}, { message: 'Forneça um endereço de e-mail válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: ' A senha deve ter no mínimo 8 caracteres.' })
  senha: string;

  @IsString({ message: 'A role deve ser um texto.' })
  @IsIn(['ALUNO', 'ADMIN', 'PROFESSOR'], { message: 'A role deve ser ALUNO, ADMIN ou PROFESSOR' })
  role: string;

  // Como módulo e professor são opcionais para ADMINs, mas importantes para ALUNOS:
  @IsOptional()
  @IsString({ message: 'O ID da turma fornecido é inálido' })
  turmaId?: string;
}
