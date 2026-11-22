package com.empresa.emprestimos.service;

import com.empresa.emprestimos.exception.ConflitoException;
import com.empresa.emprestimos.exception.NaoEncontradoException;
import com.empresa.emprestimos.model.Equipamento;
import com.empresa.emprestimos.model.TipoEquipamento;
import com.empresa.emprestimos.repository.EmprestimoRepository;
import com.empresa.emprestimos.repository.EquipamentoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EquipamentoService {

    private final EquipamentoRepository equipamentoRepository;
    private final EmprestimoRepository emprestimoRepository;

    public EquipamentoService(EquipamentoRepository equipamentoRepository,
                              EmprestimoRepository emprestimoRepository) {
        this.equipamentoRepository = equipamentoRepository;
        this.emprestimoRepository = emprestimoRepository;
    }

    public List<Equipamento> listar(TipoEquipamento tipo, Boolean disponivel) {
        if (tipo != null && disponivel != null) {
            return equipamentoRepository.findByTipoAndDisponivel(tipo, disponivel);
        }
        if (tipo != null) {
            return equipamentoRepository.findByTipo(tipo);
        }
        if (disponivel != null) {
            return equipamentoRepository.findByDisponivel(disponivel);
        }
        return equipamentoRepository.findAll();
    }

    public Equipamento buscar(Long id) {
        return equipamentoRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Equipamento não encontrado"));
    }

    public Equipamento cadastrar(Equipamento equipamento) {
        // R1
        if (equipamentoRepository.existsByPatrimonio(equipamento.getPatrimonio())) {
            throw new ConflitoException("Patrimônio já cadastrado");
        }
        equipamento.setId(null);
        // R2: todo equipamento novo nasce disponível, mesmo que o JSON mande false
        equipamento.setDisponivel(true);
        return equipamentoRepository.save(equipamento);
    }

    public Equipamento atualizar(Long id, Equipamento dados) {
        Equipamento equipamento = buscar(id);
        // copia só nome e tipo: não mexe em patrimônio nem disponibilidade
        equipamento.setNome(dados.getNome());
        equipamento.setTipo(dados.getTipo());
        return equipamentoRepository.save(equipamento);
    }

    public void remover(Long id) {
        Equipamento equipamento = buscar(id);
        // R9
        if (emprestimoRepository.existsByEquipamentoId(id)) {
            throw new ConflitoException("Equipamento tem histórico de empréstimos e não pode ser removido");
        }
        equipamentoRepository.delete(equipamento);
    }
}
