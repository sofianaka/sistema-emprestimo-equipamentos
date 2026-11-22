

let equipamentos = [];
let colaboradores = [];

const paginas = {
    equipamentos: ["Equipamentos", "Cadastre e acompanhe notebooks, monitores e headsets."],
    colaboradores: ["Colaboradores", "Quem pode pegar equipamentos emprestados."],
    emprestimos: ["Empréstimos", "Quem está com o quê, e o que está atrasado."]
};

// ---------- utilidades ----------
async function api(metodo, url, corpo) {
    const opcoes = { method: metodo, headers: {} };
    if (corpo !== undefined) {
        opcoes.headers["Content-Type"] = "application/json";
        opcoes.body = JSON.stringify(corpo);
    }
    const resp = await fetch(url, opcoes);
    if (resp.status === 204) return null;
    const dados = await resp.json().catch(() => null);
    if (!resp.ok) throw new Error((dados && dados.message) || "Erro " + resp.status);
    return dados;
}

function toast(msg, tipo) {
    const t = document.getElementById("toast");
    const icone = tipo === "erro" ? "i-alert" : "i-check";
    t.innerHTML = `<svg class="ic"><use href="#${icone}"/></svg><span>${esc(msg)}</span>`;
    t.className = "mostrar " + (tipo || "sucesso");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.className = "", 3200);
}

const esc = txt => String(txt ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const icone = (id, extra = "") => `<svg class="ic" ${extra}><use href="#${id}"/></svg>`;

function data(iso) {
    if (!iso) return "—";
    const [a, m, d] = iso.split("-");
    return `${d}/${m}/${a}`;
}

const tipos = {
    NOTEBOOK: ["Notebook", "i-laptop"],
    MONITOR: ["Monitor", "i-monitor"],
    HEADSET: ["Headset", "i-headset"]
};
const coresAvatar = ["#4f46e5", "#0891b2", "#059669", "#d97706", "#db2777", "#7c3aed", "#2563eb"];

function avatar(nome, id) {
    const partes = String(nome || "?").trim().split(/\s+/);
    const iniciais = (partes[0][0] + (partes.length > 1 ? partes[partes.length - 1][0] : "")).toUpperCase();
    return `<div class="avatar" style="background:${coresAvatar[id % coresAvatar.length]}">${esc(iniciais)}</div>`;
}

const equipPorId = id => equipamentos.find(x => x.id === id);
const colabPorId = id => colaboradores.find(x => x.id === id);

function celulaEquip(id) {
    const e = equipPorId(id);
    if (!e) return `<span class="sub">#${id}</span>`;
    return `<div class="principal">${esc(e.nome)}</div><div class="sub">${esc(e.patrimonio)}</div>`;
}

function celulaColab(id) {
    const c = colabPorId(id);
    if (!c) return `<span class="sub">#${id}</span>`;
    return `<div class="pessoa">${avatar(c.nome, c.id)}<span class="principal">${esc(c.nome)}</span></div>`;
}

const celulaPrazo = e => `<div class="principal">${data(e.dataPrevistaDevolucao)}</div><div class="sub">saiu em ${data(e.dataEmprestimo)}</div>`;

function situacaoEmp(e) {
    if (e.dataDevolucao) return `<span class="tag ok" title="Devolvido em ${data(e.dataDevolucao)}">Devolvido</span>`;
    if (e.atrasado) return `<span class="tag atraso">Atrasado</span>`;
    return `<span class="tag aberto">Em aberto</span>`;
}

const linhaVazia = (cols, msg) => `<tr><td colspan="${cols}" class="vazio">${icone("i-inbox")}${msg}</td></tr>`;
const plural = (n, s, p) => `${n} ${n === 1 ? s : p}`;

// ---------- abas ----------
document.querySelectorAll("nav button").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll("nav button").forEach(x => x.classList.remove("ativo"));
    document.querySelectorAll(".aba").forEach(x => x.classList.remove("ativa"));
    b.classList.add("ativo");
    document.getElementById("aba-" + b.dataset.aba).classList.add("ativa");
    const [titulo, sub] = paginas[b.dataset.aba];
    document.getElementById("titulo-pagina").textContent = titulo;
    document.getElementById("subtitulo-pagina").textContent = sub;
    recarregarTudo();
}));

// ---------- equipamentos ----------
async function carregarEquipamentos() {
    equipamentos = await api("GET", "/equipamentos");
    const params = new URLSearchParams();
    const tipo = document.getElementById("filtro-tipo").value;
    const disp = document.getElementById("filtro-disp").value;
    if (tipo) params.set("tipo", tipo);
    if (disp) params.set("disponivel", disp);
    const lista = params.toString() ? await api("GET", "/equipamentos?" + params) : equipamentos;

    document.getElementById("cont-equip").textContent = plural(lista.length, "item", "itens");
    document.getElementById("lista-equip").innerHTML = lista.length ? lista.map(e => {
        const [nomeTipo, ic] = tipos[e.tipo] || [e.tipo, "i-box"];
        return `
    <tr>
      <td class="id">${e.id}</td>
      <td><span class="codigo">${esc(e.patrimonio)}</span></td>
      <td class="principal">${esc(e.nome)}</td>
      <td><span class="tipo">${icone(ic)}${esc(nomeTipo)}</span></td>
      <td>${e.disponivel ? '<span class="tag ok">Disponível</span>' : '<span class="tag nao">Emprestado</span>'}</td>
      <td class="acoes">
        <button class="btn btn-ic" title="Editar" onclick="editarEquip(${e.id})">${icone("i-edit")}</button>
        <button class="btn btn-ic perigo" title="Remover" onclick="removerEquip(${e.id})">${icone("i-trash")}</button>
      </td>
    </tr>`;
    }).join("") : linhaVazia(6, "Nenhum equipamento por aqui ainda.");

    const disponiveis = equipamentos.filter(e => e.disponivel);
    document.getElementById("emp-equip").innerHTML = disponiveis.length
        ? disponiveis.map(e => `<option value="${e.id}">${esc(e.patrimonio)} · ${esc(e.nome)}</option>`).join("")
        : `<option value="">Nenhum equipamento disponível</option>`;
}

function editarEquip(id) {
    const e = equipPorId(id);
    document.getElementById("equip-id").value = e.id;
    document.getElementById("equip-patrimonio").value = e.patrimonio;
    document.getElementById("equip-patrimonio").disabled = true;
    document.getElementById("equip-nome").value = e.nome;
    document.getElementById("equip-tipo").value = e.tipo;
    document.getElementById("titulo-form-equip").textContent = "Editar equipamento #" + e.id;
    document.querySelector("#btn-equip span").textContent = "Salvar alterações";
    document.getElementById("cancelar-edicao").style.display = "flex";
    document.getElementById("equip-nome").focus();
}

function limparFormEquip() {
    document.getElementById("form-equip").reset();
    document.getElementById("equip-id").value = "";
    document.getElementById("equip-patrimonio").disabled = false;
    document.getElementById("titulo-form-equip").textContent = "Novo equipamento";
    document.querySelector("#btn-equip span").textContent = "Cadastrar equipamento";
    document.getElementById("cancelar-edicao").style.display = "none";
}

async function removerEquip(id) {
    if (!confirm("Remover o equipamento #" + id + "?")) return;
    try {
        await api("DELETE", "/equipamentos/" + id);
        toast("Equipamento removido");
        recarregarTudo();
    } catch (e) { toast(e.message, "erro"); }
}

document.getElementById("form-equip").addEventListener("submit", async ev => {
    ev.preventDefault();
    const id = document.getElementById("equip-id").value;
    const corpo = {
        nome: document.getElementById("equip-nome").value.trim(),
        tipo: document.getElementById("equip-tipo").value
    };
    try {
        if (id) {
            await api("PUT", "/equipamentos/" + id, corpo);
            toast("Equipamento atualizado");
        } else {
            corpo.patrimonio = document.getElementById("equip-patrimonio").value.trim();
            await api("POST", "/equipamentos", corpo);
            toast("Equipamento cadastrado");
        }
        limparFormEquip();
        recarregarTudo();
    } catch (e) { toast(e.message, "erro"); }
});

document.getElementById("cancelar-edicao").addEventListener("click", limparFormEquip);
document.getElementById("filtro-tipo").addEventListener("change", carregarEquipamentos);
document.getElementById("filtro-disp").addEventListener("change", carregarEquipamentos);

// ---------- colaboradores ----------
async function carregarColaboradores() {
    colaboradores = await api("GET", "/colaboradores");
    document.getElementById("cont-colab").textContent = plural(colaboradores.length, "pessoa", "pessoas");
    document.getElementById("lista-colab").innerHTML = colaboradores.length ? colaboradores.map(c => `
    <tr>
      <td class="id">${c.id}</td>
      <td><div class="pessoa">${avatar(c.nome, c.id)}<div><div class="principal">${esc(c.nome)}</div><div class="sub">${esc(c.email)}</div></div></div></td>
      <td>${esc(c.cargo) || '<span class="sub">—</span>'}</td>
      <td class="acoes"><button class="btn btn-ic" title="Ver histórico" onclick="verHistorico(${c.id})">${icone("i-history")}</button></td>
    </tr>`).join("") : linhaVazia(4, "Nenhum colaborador cadastrado.");

    document.getElementById("emp-colab").innerHTML = colaboradores.length
        ? colaboradores.map(c => `<option value="${c.id}">${esc(c.nome)}</option>`).join("")
        : `<option value="">Nenhum colaborador cadastrado</option>`;
}

async function verHistorico(id) {
    try {
        const lista = await api("GET", `/colaboradores/${id}/emprestimos`);
        const c = colabPorId(id);
        document.getElementById("historico").style.display = "block";
        document.getElementById("historico-titulo").textContent = "Histórico de " + (c ? c.nome : "#" + id);
        document.getElementById("lista-historico").innerHTML = lista.length ? lista.map(e => `
      <tr>
        <td class="id">${e.id}</td>
        <td>${celulaEquip(e.equipamentoId)}</td>
        <td>${celulaPrazo(e)}</td>
        <td>${situacaoEmp(e)}</td>
      </tr>`).join("") : linhaVazia(4, "Essa pessoa ainda não pegou nada emprestado.");
        document.getElementById("historico").scrollIntoView({ behavior: "smooth", block: "nearest" });
    } catch (e) { toast(e.message, "erro"); }
}

document.getElementById("form-colab").addEventListener("submit", async ev => {
    ev.preventDefault();
    try {
        await api("POST", "/colaboradores", {
            nome: document.getElementById("colab-nome").value.trim(),
            email: document.getElementById("colab-email").value.trim(),
            cargo: document.getElementById("colab-cargo").value.trim()
        });
        ev.target.reset();
        toast("Colaborador cadastrado");
        recarregarTudo();
    } catch (e) { toast(e.message, "erro"); }
});

// ---------- empréstimos ----------
async function carregarEmprestimos() {
    const todos = await api("GET", "/emprestimos");
    const atrasados = todos.filter(e => e.atrasado);
    const abertos = todos.filter(e => !e.dataDevolucao);

    document.getElementById("kpi-total").textContent = equipamentos.length;
    document.getElementById("kpi-disp").textContent = equipamentos.filter(e => e.disponivel).length;
    document.getElementById("kpi-abertos").textContent = abertos.length;
    document.getElementById("kpi-atrasados").textContent = atrasados.length;
    const badge = document.getElementById("badge-atrasos");
    badge.textContent = atrasados.length;
    badge.style.display = atrasados.length ? "inline-block" : "none";

    const soAtrasados = document.getElementById("filtro-atrasados").checked;
    const lista = soAtrasados ? await api("GET", "/emprestimos?atrasados=true") : todos;
    lista.sort((a, b) => b.id - a.id);

    document.getElementById("cont-emp").textContent = plural(lista.length, "registro", "registros");
    document.getElementById("lista-emp").innerHTML = lista.length ? lista.map(e => `
    <tr>
      <td class="id">${e.id}</td>
      <td>${celulaEquip(e.equipamentoId)}</td>
      <td>${celulaColab(e.colaboradorId)}</td>
      <td>${celulaPrazo(e)}</td>
      <td>${situacaoEmp(e)}</td>
      <td class="acoes">${e.dataDevolucao ? "" : `<button class="btn btn-acao" onclick="devolver(${e.id})">${icone("i-return")}Devolver</button>`}</td>
    </tr>`).join("") : linhaVazia(6, soAtrasados ? "Nenhum empréstimo atrasado. 🎉" : "Nenhum empréstimo registrado.");
}

async function devolver(id) {
    try {
        await api("PUT", `/emprestimos/${id}/devolucao`);
        toast("Devolução registrada");
        recarregarTudo();
    } catch (e) { toast(e.message, "erro"); }
}

document.getElementById("form-emp").addEventListener("submit", async ev => {
    ev.preventDefault();
    const equip = document.getElementById("emp-equip").value;
    const colab = document.getElementById("emp-colab").value;
    if (!equip || !colab) { toast("Escolha o equipamento e o colaborador", "erro"); return; }
    try {
        const e = await api("POST", `/emprestimos?equipamentoId=${equip}&colaboradorId=${colab}`);
        toast("Emprestado! Devolver até " + data(e.dataPrevistaDevolucao));
        recarregarTudo();
    } catch (e) { toast(e.message, "erro"); }
});

document.getElementById("filtro-atrasados").addEventListener("change", carregarEmprestimos);

// ---------- início ----------
document.getElementById("data-hoje").textContent =
    new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

async function recarregarTudo() {
    const status = document.getElementById("status-api");
    try {
        await carregarEquipamentos();
        await carregarColaboradores();
        await carregarEmprestimos();
        status.className = "status-api on";
        status.querySelector("span").textContent = "API online";
    } catch (e) {
        status.className = "status-api";
        status.querySelector("span").textContent = "API fora do ar";
        toast("Não consegui falar com a API: " + e.message, "erro");
    }
}
recarregarTudo();