package com.empresa.emprestimos.service;

import com.empresa.emprestimos.exception.ConflitoException;
import com.empresa.emprestimos.exception.NaoEncontradoException;
import com.empresa.emprestimos.model.Colaborador;
import com.empresa.emprestimos.repository.ColaboradorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ColaboradorService {

    private final ColaboradorRepository colaboradorRepository;

    public ColaboradorService(ColaboradorRepository colaboradorRepository) {
        this.colaboradorRepository = colaboradorRepository;
    }

    public List<Colaborador> listar() {
        return colaboradorRepository.findAll();
    }

    public Colaborador buscar(Long id) {
        return colaboradorRepository.findById(id)
                .orElseThrow(() -> new NaoEncontradoException("Colaborador não encontrado"));
    }

    public Colaborador cadastrar(Colaborador colaborador) {
        if (colaborador.getNome() == null || colaborador.getNome().isBlank()) {
            throw new IllegalArgumentException("Nome é obrigatório");
        }
        if (colaborador.getEmail() == null || colaborador.getEmail().isBlank()) {
            throw new IllegalArgumentException("E-mail é obrigatório");
        }
        // R3
        if (colaboradorRepository.existsByEmail(colaborador.getEmail())) {
            throw new ConflitoException("E-mail já cadastrado");
        }
        colaborador.setId(null);
        return colaboradorRepository.save(colaborador);
    }
}
