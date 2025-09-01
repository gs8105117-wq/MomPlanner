# MomPlanner

Um aplicativo web completo para mães com bebês de 3 meses a 2 anos, oferecendo ferramentas de planejamento e acompanhamento do desenvolvimento infantil.

## 🍼 Funcionalidades

### Dashboard Inteligente
- Resumo diário com estatísticas importantes
- Visualização das próximas mamadas e atividades
- Progresso das tarefas do dia
- Momentos especiais registrados

### Controle de Mamadas
- Registro de amamentação (peito, fórmula ou misto)
- Controle de quantidade e duração
- Histórico completo com observações
- Alertas para próximas mamadas

### Monitoramento do Sono
- Registro de início e fim das sonecas
- Controle de qualidade do sono
- Cálculo automático da duração
- Histórico de padrões de sono

### Cardápio Semanal
- Planejamento de refeições por dia da semana
- Categorias: café da manhã, almoço, lanche da tarde, jantar
- Notas e observações para cada refeição
- Visualização semanal organizada

### Gerenciamento de Tarefas
- Lista de tarefas diárias categorizadas
- Categorias: fraldas, banho, consultas, vacinas, outros
- Sistema de prioridades
- Acompanhamento de progresso

### Notas e Momentos Especiais
- Registro de marcos importantes
- Categorização por tipo (marco, preocupação, médico, geral)
- Histórico organizado por data
- Estatísticas de momentos registrados

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **shadcn/ui** componentes acessíveis
- **React Query** para gerenciamento de estado
- **React Hook Form** para formulários
- **Wouter** para roteamento
- **Date-fns** para manipulação de datas
- **Lucide React** para ícones

### Backend
- **Node.js** com Express
- **TypeScript** para type safety
- **Zod** para validação de dados
- **Sistema de storage em memória**

### Ferramentas de Desenvolvimento
- **Vite** para build e desenvolvimento
- **ESBuild** para compilação rápida
- **Drizzle ORM** (preparado para banco de dados)

## 📱 Design e UX

- **Mobile-first**: Otimizado para dispositivos móveis
- **Cores suaves**: Paleta de cores pensada para mães
- **Navegação intuitiva**: Bottom navigation para fácil acesso
- **Responsivo**: Funciona perfeitamente em qualquer tamanho de tela
- **Português**: Interface completamente localizada

## 🛠️ Como Executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITORIO]
cd momplanner
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse o aplicativo em `http://localhost:5000`

## 📁 Estrutura do Projeto

```
momplanner/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── hooks/         # Hooks customizados
│   │   └── lib/           # Utilitários e configurações
│   └── index.html
├── server/                # Backend Express
│   ├── index.ts          # Servidor principal
│   ├── routes.ts         # Rotas da API
│   └── storage.ts        # Sistema de armazenamento
├── shared/               # Código compartilhado
│   └── schema.ts        # Schemas e tipos
└── package.json
```

## 🎯 Funcionalidades Premium

O MomPlanner foi desenvolvido como uma solução premium que oferece:

- **Planejamento Completo**: Todas as ferramentas necessárias em um só lugar
- **Interface Intuitiva**: Fácil de usar mesmo para mães ocupadas
- **Dados Seguros**: Todas as informações ficam organizadas e acessíveis
- **Acompanhamento Detalhado**: Histórico completo do desenvolvimento do bebê
- **Alertas Inteligentes**: Lembretes para atividades importantes

## 🔧 Scripts Disponíveis

- `npm run dev`: Inicia o servidor de desenvolvimento
- `npm run build`: Compila o projeto para produção
- `npm run preview`: Visualiza a build de produção

## 📄 Licença

Este projeto está licenciado sob a MIT License.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia as diretrizes de contribuição antes de fazer um pull request.

## 📞 Suporte

Para suporte e dúvidas, entre em contato através dos issues do GitHub.

---

**MomPlanner** - Simplificando a vida das mães, um dia de cada vez. 💕