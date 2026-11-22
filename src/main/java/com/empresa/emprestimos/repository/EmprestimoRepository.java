package com.empresa.emprestimos.repository;

import com.empresa.emprestimos.model.Emprestimo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    // histórico da pessoa
    List<Emprestimo> findByColaboradorId(Long colaboradorId);


    boolean existsByEquipamentoId(Long equipamentoId);


    List<Emprestimo> findByDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(LocalDate data);


    boolean existsByColaboradorIdAndDataDevolucaoIsNullAndDataPrevistaDevolucaoBefore(Long colaboradorId, LocalDate data);
}
