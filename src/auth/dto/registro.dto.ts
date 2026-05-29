import { IsString, IsEmail, MinLength, IsOptional, IsIn } from 'class-validator';

export class RegistroDto {
  @IsString({ message: 'O nome deve ser um texto válido.' })
  @MinLength(3, { message: 'O nome precisa ter pelo menos 3 caracteres.' })
  nome: string;

  @IsEmail({}, { message: 'Forneça um endereço de e-mail válido' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres.' })
  senha: string;

  @IsString({ message: 'A role deve ser um texto.' })
  @IsIn(['ALUNO', 'ADMIN', 'PROFESSOR'], { message: 'A role deve ser ALUNO, ADMIN ou PROFESSOR' })
  role: string;

  @IsOptional()
  @IsString({ message: 'O ID da turma fornecido é inválido' })
  turmaId?: string;

  @IsOptional()
  @IsString()
  nome_completo?: string;

  @IsOptional()
  @IsString()
  celular?: string;

  @IsOptional()
  @IsString()
  cpf?: string;

  @IsOptional()
  @IsString()
  rg?: string;

  @IsOptional()
  @IsString()
  nascimento?: string;

  @IsOptional()
  @IsString()
  matricula?: string;

  @IsOptional()
  @IsString()
  endereco?: string;

  @IsOptional()
  @IsString()
  nomeResponsavel?: string;

  @IsOptional()
  @IsString()
  celularResponsavel?: string;

  @IsOptional()
  @IsString()
  cpfResponsavel?: string;

  @IsOptional()
  @IsString()
  rgResponsavel?: string;
}
