
# Sistema de Monitoramento de Sensores e Atuadores

Este projeto consiste em um sistema de gerenciamento de sensores e atuadores, desenvolvido com Node.js, Express e SQLite. O sistema permite a visualização e controle de atuadores, bem como o monitoramento de sensores de temperatura e umidade, com alertas para valores fora de limites predefinidos.

## Estrutura do Projeto

O sistema é dividido em duas partes principais:
1. **Backend**: Responsável pela API de gerenciamento de sensores e atuadores.
2. **Frontend**: Uma interface web para visualização e controle de dispositivos.

### Backend

O backend foi implementado utilizando:
- **Node.js**: Um ambiente de execução JavaScript server-side.
- **Express**: Framework utilizado para criar as rotas e gerenciar requisições.
- **SQLite**: Banco de dados leve utilizado para armazenar informações de sensores e atuadores.

#### Dependências do projeto
```bash
npm install express body-parser cors sqlite3
```

### Frontend

O frontend consiste em uma página HTML simples que exibe sensores e atuadores, e permite interações com os dispositivos. Esta página utiliza as seguintes tecnologias:
- **HTML**: Para estruturar a interface.
- **CSS**: Para estilização da página.
- **JavaScript**: Para fazer chamadas à API e atualizar a interface dinamicamente.

## Configurações

### Banco de Dados

As tabelas do banco de dados SQLite são criadas automaticamente ao iniciar o servidor, caso não existam. As tabelas possuem as seguintes definições:

- **Tabela de Sensores**:
    - `id`: Identificador único do sensor.
    - `nome`: Nome do sensor (deve ser único).
    - `temperatura`: Valor da temperatura registrada pelo sensor.
    - `alerta_temperatura`: Indica se a temperatura está fora dos limites (0 para normal, 1 para alerta).
    - `umidade`: Valor da umidade registrada pelo sensor.
    - `alerta_umidade`: Indica se a umidade está fora dos limites (0 para normal, 1 para alerta).

- **Tabela de Atuadores**:
    - `id`: Identificador único do atuador.
    - `nome`: Nome do atuador (deve ser único).
    - `status`: Status atual do atuador (0 para desligado, 1 para ligado).

### Rotas da API

- **Sensores**:
    - `POST /sensores`: Cadastra um novo sensor.
    - `GET /sensores`: Retorna todos os sensores cadastrados.
    - `GET /sensores/:id`: Retorna um sensor específico pelo seu ID.
    - `PUT /sensores/:id`: Atualiza os dados de um sensor.

- **Atuadores**:
    - `POST /atuadores`: Cadastra um novo atuador.
    - `GET /atuadores`: Retorna todos os atuadores cadastrados.
    - `GET /atuadores/:id`: Retorna um atuador específico pelo seu ID.
    - `PUT /atuadores/:id`: Atualiza o status de um atuador.

### Interface Web

A interface web possui uma tabela para listar os atuadores e outra para listar os sensores. Além disso, cada atuador pode ser ligado ou desligado diretamente pela interface, e os sensores exibem alertas visuais caso os valores de temperatura ou umidade estejam fora dos limites.

- **Dashboard de Atuadores**: Exibe o nome e o status de cada atuador, permitindo ligar/desligar diretamente.
- **Dashboard de Sensores**: Exibe o nome, temperatura e umidade de cada sensor, com alertas visuais para temperaturas e umidades fora dos limites.

### Configuração dos Limites de Alerta

Os limites de alerta de temperatura e umidade são definidos diretamente no código e podem ser ajustados conforme necessário. Os valores atuais são:

- **Temperatura**:
    - Limite superior: 30°C
    - Limite inferior: 10°C

- **Umidade**:
    - Limite superior: 80%
    - Limite inferior: 20%

## Como Executar o Projeto

1. Instale as dependências com o comando:
   ```bash
   npm install
   ```

2. Inicie o servidor com o comando:
   ```bash
   node server.js
   ```

3. Acesse a interface web através do navegador, no endereço:
   ```
   http://localhost:3000
   ```

## Arquivos Principais

- `server.js`: Contém toda a lógica da API e a configuração do banco de dados.
- `monitoramento.html`: Interface web para visualização e controle de sensores e atuadores.

## Contribuições

Este projeto foi desenvolvido como parte de uma atividade educacional, visando ensinar conceitos de desenvolvimento de sistemas embarcados, IoT e controle de dispositivos em tempo real.

Qualquer contribuição é bem-vinda para melhorar o sistema ou adicionar novas funcionalidades.
