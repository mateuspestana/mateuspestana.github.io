# Ambiente de prova no navegador

Protótipo estático para executar três versões da A1 diretamente no navegador com [Pyodide](https://pyodide.org/). Ele usa os notebooks e CSVs desta mesma pasta, sem instalar Python na máquina do aluno.

## Teste local

Na raiz do repositório, sirva os arquivos por HTTP e abra o endereço indicado no navegador:

```bash
python3 -m http.server 8000
```

Depois, acesse `http://localhost:8000/prova/navegador/`.

Abrir `index.html` diretamente com `file://` não funciona: o navegador bloqueia o carregamento dos notebooks e CSVs locais nesse modo.

## Entrega e privacidade

- Nome, matrícula e rascunho são salvos apenas no armazenamento local do navegador.
- Ao baixar a entrega, a identificação é incluída nos metadados do `.ipynb` e no nome do arquivo, que é formado automaticamente.
- Antes de enviar, o estudante deve abrir o arquivo baixado no VS Code e confirmar suas respostas, código e resultados.
- Não há servidor, login, envio automático ou painel do docente. Para receber entregas centralmente, publique a página e defina um canal de envio (por exemplo, atividade no Moodle/Google Classroom) ou acrescente um backend autenticado.

## Limites do piloto

Na primeira inicialização, o Pyodide e as bibliotecas científicas são baixados pelo navegador. É recomendável testar em computadores da sala, em rede estável e navegador atualizado, antes de aplicar a avaliação. A página roda os dados e o código no dispositivo do estudante; portanto, não é um ambiente de prova com bloqueio de consulta, fiscalização ou garantia de integridade.
