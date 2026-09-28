import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { TurmasService } from './turmas.service';

describe('TurmasService.editarTurma', () => {
  it('remove o vínculo do aluno retirado da turma', async () => {
    // 1. Preparar: a turma tinha um aluno.
    const turmaModel = {
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          alunos: ['aluno-1'],
        }),
      }),
      findByIdAndUpdate: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ alunos: [] }),
      }),
      updateMany: jest.fn().mockResolvedValue({}),
    };

    const userModel = {
      updateMany: jest.fn().mockResolvedValue({}),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        TurmasService,
        { provide: getModelToken('Turma'), useValue: turmaModel },
        { provide: getModelToken('User'), useValue: userModel },
        { provide: getModelToken('ClassLog'), useValue: {} },
        { provide: getModelToken('Attendance'), useValue: {} },
      ],
    }).compile();

    const service = moduleRef.get(TurmasService);

    // 2. Agir: retirar todos os alunos.
    await service.editarTurma('turma-1', { alunos: [] });

    // 3. Verificar: a remoção precisa atingir usuários.
    expect(userModel.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        _id: { $in: ['aluno-1'] },
      }),
      { $unset: { turmaId: '' } },
    );
  });
});