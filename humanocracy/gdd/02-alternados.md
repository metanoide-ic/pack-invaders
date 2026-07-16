# HUMANOCRACY — GDD Volume 2 — Os Alternados

> **Fato canônico nº 1:** os Alternados existem.
> **Fato canônico nº 2:** não existe fato canônico nº 3 acessível ao jogador.

---

## 2.1 O que se sabe (e o que "se sabe")

Os Alternados conseguem copiar humanos — **até certo ponto**. O jogo inteiro orbita a
impossibilidade de determinar esse ponto. Toda informação científica é tratada como
provisória: artigos erram, autópsias são manipuladas, exames dão resultados diferentes
em laboratórios diferentes.

| Capacidade | Status epistêmico no mundo do jogo |
|---|---|
| Copiar aparência | Provavelmente (casos documentados; fotos contestadas) |
| Copiar voz | Talvez (gravações de qualidade ruim) |
| Copiar memória | Talvez (o caso Hedvin sugere que sim; o caso Mirzapur sugere que não) |
| Copiar emoções | Sem consenso — a hipótese da "cópia emocional imperfeita" é a mais citada e a mais contestada |
| Sentir empatia | Sem consenso |
| Dormir | Ninguém sabe |
| Sentir dor | Resultados contraditórios |
| Envelhecer | Registros incompatíveis entre si |
| Possuir sangue | Depende da pesquisa |
| Possuir DNA | Alguns laboratórios: sim; outros: "muda constantemente" |

**O maior erro do jogador** (e do mundo): acreditar que existe uma característica
definitiva. Nunca existe. Todo método falha. Todo scanner produz falsos positivos e falsos
negativos. Quanto mais sofisticado o equipamento, mais sofisticados ficam os Alternados.

---

## 2.2 As seis teorias (nenhuma será confirmada)

Cada teoria tem defensores institucionais, evidências convincentes **e** contradições
fatais. O conteúdo abaixo alimenta jornais, rádio, NPCs e documentos da campanha.

### 1. Teoria da Invasão (militares, Krestov)
Espécie extraterrestre chegada há ~50 anos; conquista por infiltração, não por guerra.
*Evidência:* a curva de casos registrados começa abruptamente em 1907.
*Contradição:* os manuscritos de Bahar-Zad têm 700 anos.

### 2. Teoria da Evolução (antropólogos, Frimia)
Espécie paralela que evoluiu junto da humanidade; confundida com mitos, espíritos, demônios.
*Evidência:* os manuscritos; folclore convergente em oito culturas sem contato.
*Contradição:* nenhum fóssil, nenhum registro biológico estável.

### 3. Teoria Biológica (parte dos cientistas, Nova República)
Não há alienígenas: há um organismo parasita que reconstrói corpos. Um Alternado seria
um cadáver reprogramado.
*Evidência:* o marcador K-7 em tecidos de casos confirmados.
*Contradição:* o K-7 também aparece em pacientes com febre reumática (Dia 24 da campanha).

### 4. Teoria Religiosa (múltiplas igrejas)
Anjos caídos, demônios ou espíritos antigos — cada religião com sua interpretação.
*Evidência:* precisão perturbadora de textos antigos.
*Contradição:* as religiões se contradizem entre si em todos os detalhes verificáveis.

### 5. Teoria Militar (resistências, rádios clandestinas)
Criados em laboratório numa guerra secreta entre potências; o acidente foi encoberto.
*Evidência:* os laboratórios da Usina 9 existem; Cantalabria sabe algo.
*Contradição:* exigiria biotecnologia que nenhum país demonstra ter nem hoje.

### 6. Teoria da Simulação (físicos marginais)
"Erros de renderização" da realidade: não imitam pessoas, **sobrescrevem informações do
universo**. Quanto mais tempo infiltrados, mais difícil distinguir quem sempre existiu.
*Evidência:* os episódios de memória contraditória (Dias 44 e 47) são exatamente o que
essa teoria prevê.
*Contradição:* é infalseável — o que a torna inútil e, para alguns NPCs, irresistível.

---

## 2.3 O Estado Verdadeiro de um Alternado

Cada Alternado gerado pelo simulador possui um registro interno completo e imutável:

```
AlternadoProfile {
  identidadeAssumida     // quem ele diz ser
  substituidoOriginal    // quem existia antes (pode ser ninguém: identidade inventada)
  dataSubstituicao       // quando ocorreu
  metodo                 // nunca exibido; consistente por linhagem
  missao                 // infiltrar | observar | fugir da própria espécie | proteger alguém | desconhecida
  nivelAprendizado       // 0.0–1.0, derivado da IA adaptativa
  memoriasCopiadas       // % da vida do original que ele domina em entrevista
  redeContatos           // outros IDs de Alternados conhecidos
  estadoPsicologico      // sim, eles têm um; alguns têm medo
  limitacoes             // o que ESTE indivíduo não copia bem (voz, datas, caligrafia…)
}
```

**Alternados são indivíduos**, não monstros genéricos: alguns são perigosos, alguns apenas
observam, alguns fogem da própria espécie, alguns acreditam estar salvando a humanidade.
A missão nunca é exibida — mas governa o comportamento na entrevista, a qualidade dos
documentos e as consequências pós-aprovação (Sistema de Ecos, Volume 7).

---

## 2.4 A IA Adaptativa — "a espécie observa você"

**Princípio: sem trapaça.** Os Alternados não sabem informações impossíveis. Eles apenas
observam padrões — exatamente como o jogador observa os deles.

### O que o sistema registra (banco invisível)

- Quais documentos o jogador verifica primeiro;
- Quais scanners usa mais;
- Quais **tipos de discrepância** costuma encontrar (campo-chave do protótipo);
- Quanto tempo leva para aprovar alguém;
- Quais etnias/países/profissões desconfia mais (estatística de rejeição);
- Quais perguntas faz com frequência.

### Como o sistema responde

1. **Evitação ponderada:** ao gerar a falsificação de um Alternado, o peso de cada tipo de
   discrepância é `1 / (1 + detecções²)` — o que o jogador mais pega, eles mais evitam.
   No protótipo: `alternadoDiscWeights()` em `game.js`.
2. **Perfeição crescente:** probabilidade de documentos perfeitos
   `p = min(0.15 + dia·0.012 + médiaDetecções·0.02, 0.8)`, saltando para `0.95` no Dia 46
   ("Eles não erram mais").
3. **Atraso de aprendizado:** mudanças de estratégia do jogador levam de 2 a 4 dias para
   serem "aprendidas" (janela deslizante sobre as últimas N detecções, produção Unity).
   Jogadores imprevisíveis enfrentam Alternados piores; jogadores repetitivos treinam
   o inimigo.
4. **Infiltração social:** na produção, a espécie também observa a *sociedade* — se o mundo
   passa a confiar em médicos, infiltram médicos; se em religiosos, religiosos; se em
   crianças, crianças. Nunca por script: por leitura das variáveis de confiança da
   Memória do Mundo (Volume 7).

### Regra de comunicação

**Este sistema jamais é explicado ao jogador.** Sem tutorial, sem tooltip, sem estatística.
O jogador apenas sente que "as assinaturas ficaram boas demais desde que comecei a checar
assinaturas". Esse arrepio é o produto.

---

## 2.4b O Silente (implementado)

Duas vezes por campanha (uma entre os dias 14–24, outra entre 30–44), chega ao guichê
algo que **não é um Alternado nem um humano**. Passaporte com campos em branco ("———"),
rosto pálido de órbitas vazias que flutua meio milímetro, o rádio vira estática, a tela
dessatura. Não adianta scanner, guarda ou arma. **Três formas de perder — game over
imediato e definitivo:**

1. **Olhar de perto** (abrir o Exame Físico);
2. **Chamar alguém** (DETER — e o detector biológico vai *implorar* "POSITIVO. POSITIVO.
   DETENÇÃO RECOMENDADA" para te induzir exatamente a isso: a máquina é a armadilha);
3. **Demorar** (35 minutos sem carimbar).

A saída: **carimbar qualquer coisa, rápido, e deixar ir** — sem advertência, qualquer
carimbo serve. As regras são aprendíveis: o "amigo" do Dario avisa **na véspera**, com
um tom que ele nunca usou antes. O final de derrota ("O Que Olha de Volta") descreve o
carimbo descendo na direção do seu próprio pulso. Sobreviver às duas visitas alimenta
a conquista Steam `ACH_SILENTE`.

## 2.5 Falhas honestas do mundo (falsos positivos deliberados)

Para impedir que o jogador transforme qualquer anomalia em veredito, o mundo produz
anomalias inocentes com frequência calibrada:

- Pessoas nervosas erram datas, trocam cidades, gaguejam — **e são inocentes**;
- Datas bahari convertidas errado pelo cartório;
- Carimbos improvisados durante crises (comunicado avisa: *"não significa fraude"*);
- Scanners descalibrados acusando doentes, enlutados, autistas, apaixonados;
- Documentos legítimos antigos em estado perfeito (bem cuidados — ou falsos?).

E o inverso: Alternados que respondem perfeitamente, ou que erram — **nunca existe regra
absoluta**. A tabela de probabilidades completa está no Volume 9.
