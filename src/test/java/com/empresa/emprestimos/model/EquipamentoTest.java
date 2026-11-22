package com.empresa.emprestimos.model;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class EquipamentoTest {

    @Test
    void emprestarEquipamentoDisponivelDeixaIndisponivel() {
        Equipamento equipamento = new Equipamento();

        equipamento.emprestar();

        assertFalse(equipamento.isDisponivel());
    }

    @Test
    void naoEmprestaEquipamentoIndisponivel() {
        Equipamento equipamento = new Equipamento();
        equipamento.emprestar();

        assertThrows(IllegalStateException.class, () -> equipamento.emprestar());
    }

    @Test
    void devolverDeixaDisponivel() {
        Equipamento equipamento = new Equipamento();
        equipamento.emprestar();

        equipamento.devolver();

        assertTrue(equipamento.isDisponivel());
    }
}
