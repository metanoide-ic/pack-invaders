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

from feirao import capcut, inspetor, legendas, media, template  # noqa: E402

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


if __name__ == "__main__":
    App().mainloop()
