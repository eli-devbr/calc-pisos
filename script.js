// Niveladores (bases por m²)
const fatores = {
  "30x30": 44,
  "45x45": 20,
  "50x50": 16,
  "30x60": 22,
  "40x60": 17,
  "60x60": 11,
  "80x80": 7,
  "90x90": 5,
  "100x100": 8,
  "60x120": 12,
  "120x120": 6
};

// Cruzetas (unidades por m²)
const fatoresCruzeta = {
  "20x20": 25,
  "30x30": 12,
  "33x33": 10,
  "40x40": 7,
  "45x45": 6,
  "50x50": 5,
  "60x30": 6,
  "60x60": 4,
  "60x90": 3,
  "60x120": 3,
  "70x70": 4,
  "80x80": 4,
  "90x90": 4,
  "100x100": 4,
  "120x120": 3,
  "120x180": 3
};

// Mostra/esconde o campo de acabamento conforme o tipo
document.getElementById("tipo").addEventListener("change", function () {
  const campo = document.getElementById("campo-acabamento");
  if (this.value === "ceramica") {
    campo.classList.remove("hidden");
  } else {
    campo.classList.add("hidden");
    document.getElementById("acabamento").value = "";
  }
  // Fecha o select após a escolha
  this.blur();

  // Se mudou para porcelanato e estava marcado "sim", força "não"
  if (this.value === "porcelanato") {
    const radioSim = document.querySelector('input[name="argamassa"][value="sim"]');
    const radioNao = document.querySelector('input[name="argamassa"][value="nao"]');
    if (radioSim && radioSim.checked && radioNao) {
      radioNao.checked = true;
      // Dispara o evento change para manter consistência em qualquer dispositivo
      radioNao.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }
});

// Fecha os outros selects automaticamente ao selecionar um item
["tamanho", "acabamento"].forEach(id => {
  const el = document.getElementById(id);
  if (el) {
    el.addEventListener("change", function () {
      this.blur();
    });
  }
});

// Também fecha os radios de argamassa (ajuda no mobile) e garante funcionamento em qualquer dispositivo
document.querySelectorAll('input[name="argamassa"]').forEach(radio => {
  radio.addEventListener("change", function () {
    this.blur();
  });
  // Garante que o clique/tap funcione bem em mobile (alguns browsers atrasam o change)
  radio.addEventListener("click", function () {
    // Força a atualização do estado checked imediatamente
    this.checked = true;
  });
});

function getFator(tamanho, usarCruzeta = false) {
  const tabela = usarCruzeta ? fatoresCruzeta : fatores;

  if (tabela[tamanho]) return tabela[tamanho];

  // Fallback genérico (caso algum tamanho não esteja na tabela)
  const lados = tamanho.split("x").map(Number);
  const ladoMedio = (lados[0] + lados[1]) / 2;
  // Cruzeta usa fator menor que nivelador
  return usarCruzeta ? 100 / (ladoMedio * 4) : 100 / (ladoMedio * 1.8);
}

function calcular() {
  const area = parseFloat(document.getElementById("metragem").value);
  const tamanho = document.getElementById("tamanho").value;
  const tipo = document.getElementById("tipo").value;
  const acabamento = document.getElementById("acabamento").value;

  // Lê a opção de argamassa grátis
  const argamassaGratis = document.querySelector('input[name="argamassa"]:checked');

  // Validações básicas
  if (!argamassaGratis) {
    alert("Selecione se é elegível para argamassa grátis.");
    return;
  }
  if (!area || area <= 0) {
    alert("Informe uma metragem válida.");
    return;
  }
  if (!tamanho) {
    alert("Selecione o tamanho do piso.");
    return;
  }
  if (!tipo) {
    alert("Selecione o tipo de piso.");
    return;
  }
  if (tipo === "ceramica" && !acabamento) {
    alert("Selecione o acabamento da cerâmica.");
    return;
  }

  // Porcelanato não tem direito a argamassa grátis → força "não" se estiver marcado "sim"
  if (tipo === "porcelanato" && argamassaGratis.value === "sim") {
    const radioNao = document.querySelector('input[name="argamassa"][value="nao"]');
    if (radioNao) {
      radioNao.checked = true;
      // Dispara o evento para garantir consistência
      radioNao.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  // Re-lê após possível alteração forçada
  const elegivelGratis = document.querySelector('input[name="argamassa"]:checked').value === "sim";
  const usarCruzeta = (tipo === "ceramica" && acabamento === "boleado");

  // Cálculos comuns
  const fator = getFator(tamanho, usarCruzeta);
  const espacadores = Math.ceil(area * fator);

  // Rejunte: 1 kg a cada 4 m², convertido para pacotes de 1 kg
  const rejunteKg = Math.ceil(area / 4);
  const rejuntePacotes = rejunteKg;

  let html = "<h2>Resultado</h2><ul>";

  // ===== ARGAMASSA =====
  if (elegivelGratis) {
    // Lógica normal (com grátis) – apenas para cerâmica
    // Argamassa grátis: pega apenas a parte inteira (sem arredondar para cima)
    const gratis = Math.floor(area / 4);
    // Total necessário: usa apenas a parte inteira (sem arredondar para cima)
    const totalNecessario = Math.floor(area / 3);
    const adicionais = Math.max(0, totalNecessario - gratis);

    html += `<li>Argamassa AC1 grátis: <span class="destaque">${gratis} saco(s)</span></li>`;
    html += `<li>Argamassa adicional necessária: <span class="destaque">${adicionais} saco(s)</span></li>`;
  } else {
    // Não elegível → unifica tudo (inclui porcelanato)
    // Usa apenas a parte inteira (sem arredondar para cima)
    const argamassa = Math.floor(area / 3);
    html += `<li>Argamassa necessária: <span class="destaque">${argamassa} saco(s)</span></li>`;
  }

  // ===== REJUNTE =====
  html += `<li>Rejunte: <span class="destaque">${rejuntePacotes} pacote(s)</span></li>`;

  // ===== ESPAÇADOR =====
  // Sempre em pacotes de 100 (nivelador e cruzeta)
  const pacotes = Math.ceil(espacadores / 100);

  if (usarCruzeta) {
    html += `<li>Espaçador Cruzeta: <span class="destaque">${pacotes} pacote(s)</span></li>`;
  } else {
    html += `<li>Espaçador Nivelador: <span class="destaque">${pacotes} pacote(s)</span></li>`;
  }

  html += "</ul>";
  html += `<p class="obs">* Os espaçadores já incluem 10% de margem de perda conforme tabela de fatores.<br>
  * Valores arredondados para cima (Math.ceil), exceto a argamassa (grátis e necessária) que usa apenas a parte inteira (Math.floor).</p>`;

  const resultadoDiv = document.getElementById("resultado");
  resultadoDiv.innerHTML = html;
  resultadoDiv.classList.remove("hidden");

  // ===== ROLA A TELA SUAVEMENTE ATÉ O RESULTADO =====
  setTimeout(() => {
    resultadoDiv.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }, 100);
}