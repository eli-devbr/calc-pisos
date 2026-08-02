// Niveladores (bases por m²)
const fatores = {
  "20x20": 80,
  "30x30": 44,
  "33x33": 36,
  "45x45": 26,
  "50x50": 22,
  "60x60": 17,
  "60x90": 14,
  "60x120": 14,
  "80x80": 13,
  "90x90": 11,
  "100x100": 10,
  "120x120": 9,
  "120x180": 8
};

// Cruzetas (unidades por m²)
const fatoresCruzeta = {
  "20x20": 64,
  "30x30": 36,
  "33x33": 30,
  "45x45": 20,
  "50x50": 16,
  "60x60": 11,
  "60x90": 9,
  "60x120": 8,
  "80x80": 7,
  "90x90": 6,
  "100x100": 5,
  "120x120": 4,
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

// Também fecha os radios de argamassa (ajuda no mobile)
document.querySelectorAll('input[name="argamassa"]').forEach(radio => {
  radio.addEventListener("change", function () {
    this.blur();
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

  const elegivelGratis = argamassaGratis.value === "sim";
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
    // Lógica normal (com grátis)
    if (tipo === "porcelanato") {
      // Porcelanato: 1 saco a cada 3 m² (sem grátis)
      const argamassa = Math.ceil(area / 3);
      html += `<li>Argamassa necessária: <span class="destaque">${argamassa} saco(s)</span></li>`;
    } else {
      // Cerâmica (retificado ou boleado)
      const gratis = Math.ceil(area / 4);
      const totalNecessario = Math.ceil(area / 3);
      const adicionais = Math.max(0, totalNecessario - gratis);

      html += `<li>Argamassa AC1 grátis: <span class="destaque">${gratis} saco(s)</span></li>`;
      html += `<li>Argamassa adicional necessária: <span class="destaque">${adicionais} saco(s)</span></li>`;
    }
  } else {
    // Não elegível → unifica tudo
    const argamassa = Math.ceil(area / 3);
    html += `<li>Argamassa necessária: <span class="destaque">${argamassa} saco(s)</span></li>`;
  }

  // ===== REJUNTE =====
  html += `<li>Rejunte: <span class="destaque">${rejuntePacotes} pacote(s)</span></li>`;

  // ===== ESPAÇADOR =====
  if (usarCruzeta) {
    // Cruzeta (pacotes de 100)
    const pacotes100 = Math.ceil(espacadores / 100);
    html += `<li>Espaçador Cruzeta: <span class="destaque">${espacadores} unidades</span></li>`;
    html += `<li>→ Pacotes de 100: <span class="destaque">${pacotes100} pacote(s)</span></li>`;
  } else {
    // Nivelador (pacotes de 50 ou 100) — usado em porcelanato e cerâmica retificado
    let pacotes100 = Math.floor(espacadores / 100);
    let resto = espacadores % 100;
    let pacotes50 = resto > 0 ? Math.ceil(resto / 50) : 0;

    // Se sobrou 2 pacotes de 50 (equivalente a 100), vira mais um de 100
    if (pacotes50 === 2) {
      pacotes100 += 1;
      pacotes50 = 0;
    }

    html += `<li>Espaçador Nivelador: <span class="destaque">${espacadores} unidades</span></li>`;
    html += `<li>→ Sugestão de pacotes: `;
    if (pacotes100 > 0) html += `${pacotes100} × 100`;
    if (pacotes100 > 0 && pacotes50 > 0) html += " + ";
    if (pacotes50 > 0) html += `${pacotes50} × 50`;
    if (pacotes100 === 0 && pacotes50 === 0) html += "0";
    html += `</li>`;
  }

  html += "</ul>";
  html += `<p class="obs">* Os espaçadores já incluem 10% de margem de perda conforme tabela de fatores.<br>
  * Valores arredondados para cima (Math.ceil).</p>`;

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