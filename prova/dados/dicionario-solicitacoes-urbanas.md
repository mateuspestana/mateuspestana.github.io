# Dicionário de dados — Central de Serviços Urbanos

## Contexto e unidade de análise

Cada linha representa uma solicitação **fictícia** recebida pela Central de Serviços Urbanos do Município em Dia. Os registros foram criados exclusivamente para esta avaliação; não descrevem pessoas, bairros ou operações reais.

## Arquivos

- `dados/solicitacoes_brutas.csv`: recorte com duplicidades, categorias em grafias variadas, datas em formatos distintos e ausências intencionais.
- `dados/solicitacoes_analise.csv`: base sintética tratada para as Questões 3 e 4.

## Campos

| Campo | Descrição | Disponível na abertura? |
| --- | --- | --- |
| `id_solicitacao` | Identificador sintético da solicitação. | Sim |
| `data_abertura` / `data_conclusao` | Momento de registro e encerramento. | Apenas abertura |
| `servico` | Tipo de serviço solicitado. | Sim |
| `canal_entrada` | Meio de entrada: aplicativo, telefone, presencial ou portal. | Sim |
| `regional` | Região operacional fictícia responsável pelo atendimento. | Sim |
| `prioridade_informada` | Prioridade atribuída no registro inicial. | Sim |
| `turno_abertura`, `hora_abertura` | Período e hora do registro. | Sim |
| `demanda_prevista` | Estimativa sintética de chamados na regional naquele dia. | Sim |
| `equipe_disponivel` | Número sintético de equipes disponíveis na abertura. | Sim |
| `distancia_km` | Distância estimada até o ponto de atendimento. | Sim |
| `anexos_enviados` | Quantidade de fotos ou documentos enviados. | Sim |
| `tempo_estimado_horas` | Estimativa operacional registrada na abertura. | Sim |
| `custo_estimado_reais` | Custo sintético estimado da ordem. | Sim |
| `tempo_resolucao_horas` | Tempo transcorrido entre abertura e conclusão. | Não |

## Limites de interpretação

A base é sintética, cobre um período curto e não foi construída para estimar desempenho real de serviços públicos. Comparações entre grupos são descritivas: diferenças observadas podem refletir composição dos chamados, capacidade das equipes ou fatores não registrados.
