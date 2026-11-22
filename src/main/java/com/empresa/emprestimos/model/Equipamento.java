package com.empresa.emprestimos.model;

import jakarta.persistence.*;

@Entity
public class Equipamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String patrimonio;

    private String nome;

    @Enumerated(EnumType.STRING)
    private TipoEquipamento tipo;

    private boolean disponivel = true;

    public Equipamento() {
    }


    public void emprestar() {
        if (!disponivel) {
            throw new IllegalStateException("Equipamento indisponível");
        }
        disponivel = false;
    }

    public void devolver() {
        disponivel = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getPatrimonio() { return patrimonio; }
    public void setPatrimonio(String patrimonio) { this.patrimonio = patrimonio; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public TipoEquipamento getTipo() { return tipo; }
    public void setTipo(TipoEquipamento tipo) { this.tipo = tipo; }

    public boolean isDisponivel() { return disponivel; }
    public void setDisponivel(boolean disponivel) { this.disponivel = disponivel; }
}
