// Tabela de fatores (conjuntos por m² já com 10% de perda)
const fatores = {
  "20x20": 20,
  "30x30": 11,
  "33x33": 9,
  "45x45": 6.5,
  "50x50": 5.5,
  "60x60": 4,
  "60x90": 3,
  "60x120": 2.8,
  "80x80": 2.8,
  "90x90": 2.2,
  "100x100": 2,
  "120x120": 1.7,
  "120x180": 1.3
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
});

function getFator(tamanho) {
  if (fatores[tamanho]) return fatores[tamanho];

  // Fallback genérico (caso algum tamanho não esteja na tabela)
  // Prioriza sempre os valores da tabela quando disponíveis
  const lados = tamanho.split("x").map(Number);
  const ladoMedio = (lados[0] + lados[1]) / 2;
  return 100 / (ladoMedio * 1.8);
}

function calcular() {
  const area = parseFloat(document.getElementById("metragem").value);
  const tamanho = document.getElementById("tamanho").value;
  const tipo = document.getElementById("tipo").value;
  const acabamento = document.getElementById("acabamento").value;

  // Validações básicas
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

  // Cálculos comuns
  const fator = getFator(tamanho);
  const espacadores = Math.ceil(area * fator);
  const rejunteKg = Math.ceil(area / 4);

  let html = "<h2>Resultado</h2><ul>";

  // ===== ARGAMASSA =====
  if (tipo === "porcelanato") {
    // Porcelanato: 1 saco a cada 3 m² (sem grátis)
    const argamassa = Math.ceil(area / 3);
    html += `<li>Argamassa necessária: <span class="destaque">${argamassa} saco(s)</span> (1 a cada 3 m²)</li>`;
  } else {
    // Cerâmica (retificado ou boleado)
    // Grátis: 1 a cada 4 m²
    // Total necessário (como se fosse 1 a cada 3 m²)
    // Adicionais = total - grátis
    const gratis = Math.ceil(area / 4);
    const totalNecessario = Math.ceil(area / 3);
    const adicionais = Math.max(0, totalNecessario - gratis);

    html += `<li>Argamassa AC1 grátis: <span class="destaque">${gratis} saco(s)</span> (1 a cada 4 m²)</li>`;
    html += `<li>Argamassa adicional necessária: <span class="destaque">${adicionais} saco(s)</span></li>`;
  }

  // ===== REJUNTE =====
  html += `<li>Rejunte: <span class="destaque">${rejunteKg} kg</span> (1 kg a cada 4 m²)</li>`;

  // ===== ESPAÇADOR =====
  if (tipo === "ceramica" && acabamento === "boleado") {
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
}
