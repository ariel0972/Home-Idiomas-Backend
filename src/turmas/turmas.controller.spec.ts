import { Test } from '@nestjs/testing';
import { TurmasController } from './turmas.controller';
import { TurmasService } from './turmas.service';
import { AuthGuard } from '../auth/auth.guard';

describe('TurmasController', () => {
  let controller: TurmasController;

  const turmasServiceMock = {
    editarTurma: jest.fn(),
  };

  beforeEach(async () => {
    turmasServiceMock.editarTurma.mockReset();

    const moduleRef = await Test.createTestingModule({
      controllers: [TurmasController],
      providers: [
        {
          provide: TurmasService,
          useValue: turmasServiceMock,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = moduleRef.get(TurmasController);
  });

  it('encaminha a edição feita por um administrador ao service', async () => {
    // Preparar
    const req = {
      user: { sub: 'admin-1', role: 'ADMIN' },
    };

    const dados = { horario: '19:00 às 20:30' };
    const turmaAtualizada = { _id: 'turma-1', ...dados };

    turmasServiceMock.editarTurma.mockResolvedValue(turmaAtualizada);

    // Agir
    const resultado = await controller.editar(req, 'turma-1', dados);

    // Verificar
    expect(turmasServiceMock.editarTurma).toHaveBeenCalledWith(
      'turma-1',
      dados,
    );
    expect(resultado).toEqual(turmaAtualizada);
  });
});
