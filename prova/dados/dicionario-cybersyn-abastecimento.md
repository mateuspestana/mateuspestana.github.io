# Dicionário de dados — Operação de abastecimento CyberSyn

## Contexto histórico e didático

O Project Cybersyn/Synco foi um sistema chileno de coordenação econômica desenvolvido entre 1971 e 1973, durante o governo Salvador Allende. Ele conectava unidades por telex e usava indicadores operacionais para chamar atenção a desvios. Durante a greve de caminhoneiros de outubro de 1972, a rede ajudou a coordenar transporte de bens essenciais.

Esta base é **inteiramente sintética**: não reconstrói pessoas, rotas, empresas, decisões ou carregamentos reais. Ela usa esse contexto apenas para a atividade de análise.

## Arquivos

| Arquivo | Uso |
| --- | --- |
| `dados/carregamentos_brutos.csv` | Inspeção e limpeza, com formatos e ausências intencionais. |
| `dados/carregamentos_analise.csv` | Base tratada para as Questões 3 e 4. |

## Campos

| Campo | Significado | Disponível antes da saída? |
| --- | --- | --- |
| `id_carregamento` | Identificador sintético da remessa. | Sim |
| `data_registro` | Momento em que a remessa entra na fila. | Sim |
| `tipo_carga`, `origem`, `destino` | Características da remessa e do trajeto. | Sim |
| `prioridade_solicitada` | Prioridade inicial atribuída pela central. | Sim |
| `distancia_km`, `peso_toneladas` | Medidas sintéticas do trajeto e da carga. | Sim |
| `estoque_destino_dias` | Cobertura estimada do destino no momento do registro. | Sim |
| `caminhoes_disponiveis`, `combustivel_disponivel_litros` | Recursos operacionais disponíveis na origem. | Sim |
| `carga_perecivel` | Indicador de perecibilidade da carga. | Sim |
| `prazo_horas` | Prazo operacional estabelecido no registro. | Sim |
| `tempo_entrega_horas` | Tempo efetivamente gasto até a entrega. | Não |

## Limites

Os dados não permitem avaliar a greve real nem o desempenho histórico do Cybersyn. Relações observadas são descritivas e podem refletir fatores simulados que não aparecem nas colunas.
