"""Janela do app. Clique duas vezes em RODAR.bat para abrir.

A interface so chama o nucleo (pasta feirao/) e mostra o andamento; toda a
logica pesada esta la, testada em testes/test_nucleo.py.
"""

from __future__ import annotations

import os
import queue
import sys
import threading
import traceback

import tkinter as tk
from tkinter import filedialog, messagebox, ttk

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from feirao import (audio, capcut, cerebro, curadoria, executor,  # noqa: E402
                    inspetor, legendas, media, montagem, template)

PASTA_SAIDA = os.path.join(os.path.expanduser("~"), "Desktop", "Feirao")


class App(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Feirão — automação de edição")
        self.geometry("760x620")
        self.minsize(680, 560)

        self.fila = queue.Queue()
        self.video = tk.StringVar(value="")
        self.cortar = tk.BooleanVar(value=True)
        self.legendar = tk.BooleanVar(value=True)
        self.modelo = tk.StringVar(value=legendas.MODELO_PADRAO)
        self.ocupado = False

        self._monta()
        self.after(100, self._drena_fila)

    # ------------------------------------------------------------ layout

    def _monta(self):
        pad = {"padx": 10, "pady": 6}

        p1 = ttk.LabelFrame(self, text="Passo 1 — Mapear o seu CapCut")
        p1.pack(fill="x", **pad)
        ttk.Label(p1, wraplength=700, justify="left", text=(
            "Monte um projeto no CapCut do jeito que você quer que os vídeos "
            "fiquem (esse vira o seu MODELO). Depois clique abaixo: o app "
            "gera um relatório da estrutura do projeto, sem os seus caminhos "
            "pessoais. Me mande esse arquivo para eu ensinar o app a montar "
            "projetos sozinho.")).pack(anchor="w", padx=8, pady=(6, 2))
        linha = ttk.Frame(p1)
        linha.pack(fill="x", padx=8, pady=(0, 8))
        ttk.Button(linha, text="Procurar meu CapCut e gerar relatório",
                   command=self.inspecionar).pack(side="left")
        self.lbl_capcut = ttk.Label(linha, text="")
        self.lbl_capcut.pack(side="left", padx=10)

        p2 = ttk.LabelFrame(self, text="Passo 2 — Preparar um vídeo")
        p2.pack(fill="x", **pad)
        linha = ttk.Frame(p2)
        linha.pack(fill="x", padx=8, pady=6)
        ttk.Button(linha, text="Escolher vídeo...",
                   command=self.escolher).pack(side="left")
        ttk.Label(linha, textvariable=self.video, foreground="#555",
                  wraplength=520).pack(side="left", padx=10)

        ops = ttk.Frame(p2)
        ops.pack(fill="x", padx=8, pady=(0, 6))
        ttk.Checkbutton(ops, text="Cortar silêncios",
                        variable=self.cortar).pack(side="left")
        ttk.Checkbutton(ops, text="Gerar legendas (.srt)",
                        variable=self.legendar).pack(side="left", padx=14)
        ttk.Label(ops, text="qualidade:").pack(side="left")
        ttk.Combobox(ops, textvariable=self.modelo, values=legendas.MODELOS,
                     width=9, state="readonly").pack(side="left", padx=4)

        self.btn_rodar = ttk.Button(p2, text="Preparar",
                                    command=self.preparar)
        self.btn_rodar.pack(anchor="w", padx=8, pady=(0, 8))

        p2b = ttk.LabelFrame(self, text="Passo 3 — Pedir a edição em português")
        p2b.pack(fill="x", **pad)
        ttk.Label(p2b, wraplength=700, justify="left", text=(
            "Escreva o que quer, como falaria com um editor. Ex.: \"corta os "
            "silêncios, deixa a cor puxada pro quente e quando ele falar "
            "RASGANDO PREÇO mostra a palavra PREÇO num papel sendo rasgado\"."
        )).pack(anchor="w", padx=8, pady=(6, 2))
        self.pedido = tk.Text(p2b, height=4, wrap="word")
        self.pedido.pack(fill="x", padx=8, pady=(0, 6))
        linha_trilha = ttk.Frame(p2b)
        linha_trilha.pack(fill="x", padx=8, pady=(0, 4))
        ttk.Button(linha_trilha, text="Música de fundo (opcional)...",
                   command=self.escolher_trilha).pack(side="left")
        self.trilha = tk.StringVar(value="")
        self.lbl_trilha = ttk.Label(linha_trilha, foreground="#555",
                                    text="nenhuma")
        self.lbl_trilha.pack(side="left", padx=10)
        ttk.Button(linha_trilha, text="tirar",
                   command=self.tirar_trilha).pack(side="left")
        linha = ttk.Frame(p2b)
        linha.pack(fill="x", padx=8, pady=(0, 8))
        self.btn_editar = ttk.Button(linha, text="Editar com IA",
                                     command=self.editar_ia)
        self.btn_editar.pack(side="left")
        self.lbl_ia = ttk.Label(linha, foreground="#777", text="")
        self.lbl_ia.pack(side="left", padx=10)

        p4 = ttk.LabelFrame(self, text="Passo 4 — Criar um vídeo do zero")
        p4.pack(fill="x", **pad)
        ttk.Label(p4, wraplength=700, justify="left", text=(
            "Escolha as fotos dos carros e preencha uma oferta por linha, "
            "no formato:  carro | preço | condição")).pack(
                anchor="w", padx=8, pady=(6, 2))
        linha = ttk.Frame(p4)
        linha.pack(fill="x", padx=8, pady=(0, 4))
        ttk.Button(linha, text="Escolher fotos...",
                   command=self.escolher_fotos).pack(side="left")
        ttk.Button(linha, text="Usar uma pasta (a IA escolhe)",
                   command=self.escolher_pasta).pack(side="left", padx=6)
        self.lbl_fotos = ttk.Label(linha, foreground="#555", text="nenhuma")
        self.lbl_fotos.pack(side="left", padx=10)
        self.ofertas = tk.Text(p4, height=4, wrap="none",
                               font=("Consolas", 9))
        self.ofertas.pack(fill="x", padx=8, pady=(0, 6))
        self.ofertas.insert("1.0",
                            "ONIX 1.0 | R$ 59.990 | ENTRADA + 48X\n"
                            "HB20 SENSE | R$ 62.990 | 0KM 2024")
        ttk.Button(p4, text="Montar vídeo",
                   command=self.montar).pack(anchor="w", padx=8, pady=(0, 8))

        p3 = ttk.LabelFrame(self, text="Andamento")
        p3.pack(fill="both", expand=True, **pad)
        self.barra = ttk.Progressbar(p3, mode="determinate", maximum=100)
        self.barra.pack(fill="x", padx=8, pady=(8, 4))
        quadro = ttk.Frame(p3)
        quadro.pack(fill="both", expand=True, padx=8, pady=(0, 8))
        self.log = tk.Text(quadro, height=12, wrap="word",
                           font=("Consolas", 9))
        rolagem = ttk.Scrollbar(quadro, command=self.log.yview)
        self.log.configure(yscrollcommand=rolagem.set, state="disabled")
        self.log.pack(side="left", fill="both", expand=True)
        rolagem.pack(side="right", fill="y")

        self.escreve(f"Os arquivos prontos vão para:\n  {PASTA_SAIDA}\n")

    # -------------------------------------------------------------- util

    def escreve(self, texto: str):
        self.fila.put(("log", texto))

    def _drena_fila(self):
        """Traz as mensagens das threads de trabalho para a tela."""
        try:
            while True:
                tipo, valor = self.fila.get_nowait()
                if tipo == "log":
                    self.log.configure(state="normal")
                    self.log.insert("end", valor + "\n")
                    self.log.see("end")
                    self.log.configure(state="disabled")
                elif tipo == "barra":
                    self.barra["value"] = valor
                elif tipo == "capcut":
                    self.lbl_capcut.configure(text=valor)
                elif tipo == "fim":
                    self.ocupado = False
                    self.btn_rodar.configure(state="normal")
        except queue.Empty:
            pass
        self.after(100, self._drena_fila)

    def _em_thread(self, alvo):
        if self.ocupado:
            messagebox.showinfo("Aguarde", "Já tem trabalho em andamento.")
            return
        self.ocupado = True
        self.btn_rodar.configure(state="disabled")

        def embrulho():
            try:
                alvo()
            except Exception as erro:
                self.escreve(f"\nERRO: {erro}")
                self.escreve(traceback.format_exc(limit=3))
            finally:
                self.fila.put(("fim", None))

        threading.Thread(target=embrulho, daemon=True).start()

    # ------------------------------------------------------------ acoes

    def escolher_trilha(self):
        caminho = filedialog.askopenfilename(
            title="Música de fundo",
            filetypes=[("Áudio", "*.mp3 *.m4a *.wav *.aac *.ogg *.flac"),
                       ("Todos", "*.*")])
        if not caminho:
            return
        self.trilha.set(caminho)
        self.lbl_trilha.config(text=os.path.basename(caminho))

    def tirar_trilha(self):
        self.trilha.set("")
        self.lbl_trilha.config(text="nenhuma")

    def inspecionar(self):
        self._em_thread(self._inspecionar)

    def _inspecionar(self):
        self.escreve("\nProcurando a pasta de projetos do CapCut...")
        pasta = capcut.acha_pasta_projetos()
        if not pasta:
            self.escreve("Não achei sozinho. Escolha a pasta na janela.")
            pasta = filedialog.askdirectory(
                title="Pasta com os projetos do CapCut "
                      "(...\\User Data\\Projects\\com.lveditor.draft)")
            if not pasta or not capcut.eh_pasta_de_projetos(pasta):
                self.escreve("Pasta inválida — não tem projetos do CapCut.")
                return

        self.fila.put(("capcut", "encontrado"))
        self.escreve(f"Pasta: {pasta}")

        projetos = capcut.lista_projetos(pasta)
        if not projetos:
            self.escreve("A pasta existe mas está sem projetos. "
                         "Crie um projeto no CapCut e salve antes.")
            return

        self.escreve(f"{len(projetos)} projeto(s). Usando o mais recente: "
                     f"{projetos[0].nome}")
        os.makedirs(PASTA_SAIDA, exist_ok=True)
        destino = os.path.join(PASTA_SAIDA, "inspecao_capcut.json")
        inspetor.salva_relatorio(projetos[0], destino)

        self.escreve("\n" + inspetor.texto_resumido(
            inspetor.inspeciona(projetos[0])))
        self.escreve(f"\nPRONTO. Me mande este arquivo:\n  {destino}")
        self.fila.put(("barra", 100))

    def escolher(self):
        caminho = filedialog.askopenfilename(
            title="Escolha o vídeo",
            filetypes=[("Vídeos", "*.mp4 *.mov *.mkv *.avi *.m4v"),
                       ("Todos", "*.*")])
        if caminho:
            self.video.set(caminho)

    def preparar(self):
        if not self.video.get():
            messagebox.showinfo("Falta o vídeo", "Escolha um vídeo primeiro.")
            return
        self._em_thread(self._preparar)

    def _preparar(self):
        entrada = self.video.get()
        nome = os.path.splitext(os.path.basename(entrada))[0]
        os.makedirs(PASTA_SAIDA, exist_ok=True)

        self.fila.put(("barra", 5))
        self.escreve(f"\nLendo {os.path.basename(entrada)}...")
        info = media.sonda(entrada)
        self.escreve(f"  {info.duracao:.1f}s · {info.largura}x{info.altura} · "
                     f"{info.fps:.0f}fps · áudio: "
                     f"{'sim' if info.tem_audio else 'NÃO'}")
        if not info.tem_audio and (self.cortar.get() or self.legendar.get()):
            self.escreve("  Vídeo sem áudio: nada a cortar nem a legendar.")
            return

        trechos = []
        if self.cortar.get():
            self.fila.put(("barra", 15))
            self.escreve("\nProcurando silêncios...")
            silencios = media.acha_silencios(entrada)
            trechos = media.trechos_uteis(info.duracao, silencios)
            cortado = round(info.duracao - sum(f - i for i, f in trechos), 1)
            self.escreve(f"  {len(silencios)} silêncio(s), {cortado}s a menos "
                         f"({len(trechos)} trecho(s) mantido(s))")

        falas = []
        if self.legendar.get():
            self.fila.put(("barra", 30))
            if not legendas.disponivel():
                self.escreve("\nfaster-whisper não instalado — pulando as "
                             "legendas.\n  Para ativar: pip install "
                             "faster-whisper")
            else:
                self.escreve("\nTranscrevendo (roda na sua máquina, "
                             "nada sobe para a internet)...")
                falas = legendas.transcreve(entrada, modelo=self.modelo.get(),
                                            progresso=self.escreve)
                self.escreve(f"  {len(falas)} fala(s)")

        self.fila.put(("barra", 70))
        if self.cortar.get() and trechos:
            saida = os.path.join(PASTA_SAIDA, f"{nome}_cortado.mp4")
            self.escreve(f"\nExportando o corte...")
            media.corta(entrada, saida, trechos, progresso=self.escreve)
            self.escreve(f"  {saida}")

        if falas:
            # se cortamos, as legendas precisam andar junto
            finais = legendas.desloca(falas, trechos) if trechos else falas
            srt = os.path.join(PASTA_SAIDA, f"{nome}.srt")
            legendas.salva_srt(finais, srt)
            self.escreve(f"  {srt}")
            self.escreve("\nNo CapCut: Legendas > Importar legendas > "
                         "escolha esse .srt")

        self.fila.put(("barra", 100))
        self.escreve("\nPronto.")

    # ---------------------------------------------------- criar do zero

    def escolher_fotos(self):
        caminhos = filedialog.askopenfilenames(
            title="Escolha as fotos e clipes, na ordem que devem aparecer",
            filetypes=[("Fotos e vídeos",
                        "*.jpg *.jpeg *.png *.webp *.mp4 *.mov"),
                       ("Todos", "*.*")])
        if caminhos:
            self.fotos = list(caminhos)
            self.lbl_fotos.configure(text=f"{len(self.fotos)} arquivo(s)")

    def escolher_pasta(self):
        pasta = filedialog.askdirectory(title="Pasta com as fotos dos carros")
        if pasta:
            self.pasta = pasta
            self.lbl_fotos.configure(text=os.path.basename(pasta) + " (pasta)")
            self._em_thread(self._curar)

    def _curar(self):
        """Descarta o que nao presta e deixa a IA escolher o resto."""
        fotos = curadoria.lista_pasta(self.pasta)
        self.escreve(f"\n{len(fotos)} imagem(ns) na pasta.")
        if not fotos:
            return

        if not cerebro.disponivel():
            ok, ruins = curadoria.triagem(fotos)
            self.escreve("Sem chave de API: fiz so a triagem básica.")
            for r in ruins:
                self.escreve(f"  fora: {os.path.basename(r['arquivo'])} "
                             f"— {r['motivo']}")
            self.fotos = [m["arquivo"] for m in ok]
        else:
            pedido = self.pedido.get("1.0", "end").strip()
            r = curadoria.escolhe(fotos, pedido, progresso=self.escreve)
            self.escreve(f"\n{r['resumo']}\n")
            for e in r["escolhidas"]:
                marca = " [ABRE O VÍDEO]" if e["destaque"] else ""
                self.escreve(f"  usa: {os.path.basename(e['arquivo'])}"
                             f"{marca} — {e['motivo']}")
            for x in r["recusadas"]:
                self.escreve(f"  fora: {os.path.basename(x['arquivo'])} "
                             f"— {x['motivo']}")
            self.fotos = [e["arquivo"] for e in r["escolhidas"]]

        self.lbl_fotos.configure(text=f"{len(self.fotos)} escolhida(s)")
        self.escreve(f"\n{len(self.fotos)} foto(s) prontas. Clique em "
                     f"'Montar vídeo'.")

    def _le_ofertas(self) -> list:
        """Uma oferta por linha: carro | preço | condição."""
        saida = []
        for linha in self.ofertas.get("1.0", "end").splitlines():
            if not linha.strip():
                continue
            partes = [p.strip() for p in linha.split("|")]
            saida.append({"carro": partes[0] if partes else "",
                          "preco": partes[1] if len(partes) > 1 else "",
                          "condicao": partes[2] if len(partes) > 2 else ""})
        return saida

    def montar(self):
        if not getattr(self, "fotos", None):
            messagebox.showinfo("Faltam as fotos",
                                "Escolha pelo menos uma foto ou clipe.")
            return
        self._em_thread(self._montar)

    def _montar(self):
        os.makedirs(PASTA_SAIDA, exist_ok=True)
        ofertas = self._le_ofertas()
        self.escreve(f"\nMontando com {len(self.fotos)} mídia(s) e "
                     f"{len(ofertas)} oferta(s)...")
        if len(ofertas) < len(self.fotos):
            self.escreve(f"  ({len(self.fotos) - len(ofertas)} mídia(s) vão "
                         f"aparecer sem texto)")

        self.fila.put(("barra", 20))
        conf = template.carrega(os.path.join(PASTA_SAIDA,
                                             template.ARQUIVO_PADRAO))
        saida = os.path.join(PASTA_SAIDA, "feirao_montado.mp4")
        r = montagem.monta(self.fotos, saida, ofertas=ofertas, conf=conf,
                           progresso=self.escreve)

        # o vídeo montado nasce com trilha silenciosa; se você escolheu uma
        # música no Passo 3, ela entra aqui mesmo — sem fala, pode vir alta
        trilha = self.trilha.get().strip()
        if trilha:
            self.fila.put(("barra", 80))
            self.escreve(f"  colocando {os.path.basename(trilha)}...")
            com_musica = os.path.join(PASTA_SAIDA, "feirao_montado_musica.mp4")
            try:
                audio.aplica(r["video"], com_musica, r["duracao"],
                             tem_audio=True, trilha=trilha, volume_trilha=0.7,
                             abaixar_na_fala=False, volume_original=0.0)
                r["video"] = com_musica
            except Exception as erro:
                self.escreve(f"  (!) não consegui colocar a música: {erro}")

        self.fila.put(("barra", 100))
        self.escreve(f"\n  {r['video']}  ({r['duracao']}s, "
                     f"{len(r['blocos'])} blocos)")
        self.escreve("\nDica: dá para jogar esse vídeo no Passo 3 e pedir "
                     "legendas e animações em cima dele.")

    # ------------------------------------------------------- edicao por IA

    def editar_ia(self):
        if not self.video.get():
            messagebox.showinfo("Falta o vídeo", "Escolha um vídeo primeiro.")
            return
        if not self.pedido.get("1.0", "end").strip():
            messagebox.showinfo("Falta o pedido",
                                "Escreva o que você quer que eu faça.")
            return
        if not cerebro.disponivel():
            messagebox.showinfo(
                "Falta configurar",
                "Para a edição por IA:\n\n"
                "1) pip install anthropic\n"
                '2) setx ANTHROPIC_API_KEY "sua-chave"\n'
                "   (pegue em console.anthropic.com)\n\n"
                "Depois feche e abra o app.")
            return
        self._em_thread(self._editar_ia)

    def _editar_ia(self):
        entrada = self.video.get()
        pedido = self.pedido.get("1.0", "end").strip()
        os.makedirs(PASTA_SAIDA, exist_ok=True)

        self.fila.put(("barra", 10))
        self.escreve(f"\nOuvindo {os.path.basename(entrada)}...")
        falas = []
        if legendas.disponivel():
            falas = legendas.transcreve(entrada, modelo=self.modelo.get(),
                                        progresso=self.escreve)
            self.escreve(f"  {len(falas)} fala(s)")
        else:
            self.escreve("  sem faster-whisper: vou planejar só pela imagem, "
                         "sem saber o que foi dito")

        trilha = self.trilha.get().strip() or None
        if trilha:
            self.escreve(f"  trilha: {os.path.basename(trilha)}")

        self.fila.put(("barra", 35))
        plano = cerebro.entende_e_planeja(entrada, pedido, falas,
                                          progresso=self.escreve,
                                          trilha=trilha)

        self.escreve(f"\nPLANO: {plano.resumo}")
        for a in plano.acoes:
            self.escreve(f"  {a!r} {a.motivo}")
        for aviso in plano.avisos:
            self.escreve(f"  (!) {aviso}")

        self.fila.put(("barra", 60))
        self.escreve("\nAplicando...")
        r = executor.aplica(plano, entrada, PASTA_SAIDA,
                            progresso=self.escreve, falas=falas,
                            trilha=trilha)

        # a transcricao ja existe; vira .srt seguindo a mesma linha do tempo
        # que o video (corte, velocidade e transicao juntos)
        if falas:
            nome = os.path.splitext(os.path.basename(entrada))[0]
            dur = media.sonda(entrada).duracao
            linha = executor.linha_do_plano(plano, dur)
            finais = legendas.remapeia(falas, linha) if linha.mexeu() else falas
            srt = os.path.join(PASTA_SAIDA, f"{nome}.srt")
            legendas.salva_srt(finais, srt)
            self.escreve(f"  legendas: {srt}")

        self.escreve("")
        if r["previa"]:
            self.escreve(f"  vídeo editado: {r['previa']}")
        for c in r["camadas"]:
            self.escreve(f"  camada: {c}")
        for aviso in r["avisos"]:
            self.escreve(f"  (!) {aviso}")
        self.escreve(f"  roteiro: {r['arquivo_roteiro']}")
        self.escreve("\nAbra o roteiro: ele diz em que segundo entra cada "
                     "camada no CapCut.")
        self.fila.put(("barra", 100))


if __name__ == "__main__":
    App().mainloop()
