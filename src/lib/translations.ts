export const translations = {
  pt: {
    menu: {
      home: "Início",
      pokedex: "Pokédex",
      items: "Itens",
      admin: "Admin",
      login: "Entrar",
      logout: "Sair"
    },
    carousel: {
      slides: [
        {
          title: "POKÉWIKI",
          subtitle: "BEM-VINDO",
          description: "A maior enciclopédia interativa de Pokémons. Explore todos os detalhes, estatísticas e descubra novas aventuras neste universo incrível!",
          price: "INÍCIO"
        },
        {
          title: "CHARIZARD",
          subtitle: "CHAMA",
          description: "Sopra fogo quente o suficiente para derreter pedras. Conhecido por causar incêndios florestais intencionalmente.",
          price: "#0006"
        },
        {
          title: "BLASTOISE",
          subtitle: "MARÉ",
          description: "Um Pokémon brutal com jatos de água em sua carapaça. Eles são usados para ataques de alta pressão.",
          price: "#0009"
        },
        {
          title: "VENUSAUR",
          subtitle: "FLORESTA",
          description: "A planta floresce quando está absorvendo energia solar. Fica em movimento para buscar a luz do sol.",
          price: "#0003"
        }
      ],
      buttons: {
        seeMore: "VER MAIS",
        explore: "Explorar Wiki"
      }
    },
    home: {
      exploreTitle: "Explore o Mundo Pokémon",
      exploreSubtitle: "Encontre informações detalhadas sobre as espécies, evoluções, habilidades e status base.",
      features: [
        {
          title: "Pokédex Completa",
          description: "Milhares de Pokémons detalhados com informações precisas e imagens de alta qualidade."
        },
        {
          title: "Gerenciamento Rápido",
          description: "Para administradores: adicione, edite ou remova Pokémons com facilidade usando uma interface moderna."
        },
        {
          title: "Design Responsivo",
          description: "Navegue perfeitamente no celular, tablet ou desktop com uma experiência fluida."
        }
      ],
      exploreButton: "Explorar Pokédex"
    },
    items: {
      title: "Itens",
      subtitle: "Lista de todos os itens",
      searchPlaceholder: "Buscar item por nome ou categoria...",
      cost: "Custo:",
      category: "Categoria:",
      noItems: "Nenhum item encontrado."
    },
    itemModal: {
      itemNo: "ITEM Nº",
      category: "Categoria",
      cost: "Custo",
      unbuyable: "Não comprável",
      detailedEffect: "Efeito Detalhado",
      loading: "Buscando detalhes...",
      error: "Não foi possível carregar os detalhes do item."
    },
    filters: {
      search: "Procurar",
      searchItem: "Procurar item",
      searchGlobal: "Procurar Pokémon ou Item...",
      allGenerations: "Todas as gerações",
      allTypes: "Todos os tipos",
      anyRarity: "Qualquer raridade",
      allCategories: "Todas as categorias",
      sortBy: "Ordenar por",
      sortAlpha: "Alfabética",
      sortRarity: "Raridade",
      sortGen: "Geração",
      sortElement: "Elementar",
      sortDefault: "Padrão",
      showing: "Exibindo",
      otherOptions: "Outras opções",
      clearFilters: "Limpar filtros",
      clear: "Limpar",
      seeResults: "Ver Resultados",
      generation: "Geração",
      type: "Tipo",
      rarity: "Raridade",
      order: "Ordenação",
      options: "Opções",
      listAlpha: "Lista em ordem alfabética",
      listRarity: "Lista em ordem de raridade",
      listGen: "Lista em ordem de geração",
      listElement: "Lista por ordem elementar",
      showMegas: "Mega evoluções",
      showAlola: "Região de Alola",
      showGalar: "Região de Galar",
      showHisui: "Região de Hisui",
      showPaldea: "Região de Paldea",
      selected: "selecionadas",
      selectedM: "selecionados",
      types: "tipos",
      categories: "categorias",
      category: "Categoria",
      noResults: "Nenhum resultado encontrado.",
      noResultsQuery: "Nenhum resultado para",
      typeMore: "Digite pelo menos 2 caracteres para começar a buscar",
      noPokemon: "Nenhum Pokémon encontrado com os filtros atuais.",
      clearSearch: "Limpar Pesquisa",
      noItem: "Nenhum item encontrado",
      tryAnother: "Tente buscar por outro termo ou remova os filtros."
    },
    rarities: {
      "Comum": "Comum",
      "Incomum": "Incomum",
      "Raro": "Raro",
      "Épico": "Épico",
      "Único": "Único",
      "Lendário": "Lendário",
      "Mítico": "Mítico"
    },
    itemCategories: {
      "Pokébolas": "Pokébolas",
      "Medicina": "Medicina",
      "Batalha": "Batalha",
      "Evolução": "Evolução",
      "Comida": "Comida",
      "Chaves e Especiais": "Chaves e Especiais",
      "Outros": "Outros"
    },
    adminMenu: {
      dashboard: "Meu Painel",
      addPokemon: "Adicionar Pokémons",
      addAdmin: "Adicionar Admins",
      logout: "Sair",
    },
    login: {
      welcome: "Bem-vindo de volta!",
      subtitle: "Faça login para gerenciar a Pokédex",
      email: "Email",
      password: "Senha",
      enter: "Entrar",
      entering: "Entrando...",
      errorCredentials: "Email ou senha incorretos.",
      errorConfirm: "Por favor, confirme seu email antes de fazer login.",
      onlyAdmins: "Só pessoas cadastradas por um admin podem efetuar login",
    },
    adminPokemon: {
      back: "Voltar para o Painel",
      title: "Cadastrar Pokémon",
      subtitle: "Adicione um novo Pokémon ao banco de dados da Pokewiki.",
      name: "Nome",
      type: "Tipo (Máx. 2)",
      imageUrl: "URL da Imagem",
      weaknesses: "Fraquezas",
      description: "Descrição",
      save: "Salvar Pokémon",
      saving: "Salvando...",
      errorName: "Digite o nome do Pokémon antes de buscar.",
      errorPokeApi: "Erro ao buscar na PokéAPI.",
      errorCreate: "Erro ao cadastrar pokémon.",
    },
    adminUsers: {
      title: "Gerenciar Administradores",
      subtitle: "Crie novas contas, altere permissões e gerencie acessos.",
      newAdmin: "Novo Administrador",
      email: "Email da Conta",
      role: "Cargo Atual",
      actions: "Ações",
      you: "Você",
      loading: "Carregando usuários...",
      noUsers: "Nenhum usuário encontrado.",
      removeAdmin: "Remover Admin",
      makeAdmin: "Tornar Admin",
      createTitle: "Criar Novo Administrador",
      nameOptional: "Nome (Opcional)",
      cancel: "Cancelar",
      createAccount: "Criar Conta",
      creating: "Criando...",
      editTitle: "Editar Conta",
      newName: "Novo Nome",
      newNamePlaceholder: "Deixe em branco para manter",
      newPassword: "Nova Senha",
      newPasswordPlaceholder: "Deixe em branco para não alterar",
      saveChanges: "Salvar Alterações",
      saving: "Salvando...",
      errorUnknown: "Erro desconhecido",
    },
    pokemonTypes: {
      'Fogo': 'Fogo',
      'Água': 'Água',
      'Elétrico': 'Elétrico',
      'Aço': 'Aço',
      'Luta': 'Luta',
      'Psíquico': 'Psíquico',
      'Escuridão': 'Escuridão',
      'Normal': 'Normal',
      'Dragão': 'Dragão',
      'Fada': 'Fada',
      'Gelo': 'Gelo',
      'Planta': 'Planta',
      'Venenoso': 'Venenoso',
      'Terra': 'Terra',
      'Voador': 'Voador',
      'Inseto': 'Inseto',
      'Rocha': 'Rocha',
      'Fantasma': 'Fantasma'
    },
    pokemonGenerations: {
      '1ª Geração (1-151)': '1ª Geração (1-151)',
      '2ª Geração (152-251)': '2ª Geração (152-251)',
      '3ª Geração (252-386)': '3ª Geração (252-386)',
      '4ª Geração (387-493)': '4ª Geração (387-493)',
      '5ª Geração (494-649)': '5ª Geração (494-649)',
      '6ª Geração (650-721)': '6ª Geração (650-721)',
      '7ª Geração (722-809)': '7ª Geração (722-809)',
      '8ª Geração (810-905)': '8ª Geração (810-905)',
      '9ª Geração (906-1025)': '9ª Geração (906-1025)'
    },
    pokemonGenerationsShort: {
      'generation-i': '1ª Geração',
      'generation-ii': '2ª Geração',
      'generation-iii': '3ª Geração',
      'generation-iv': '4ª Geração',
      'generation-v': '5ª Geração',
      'generation-vi': '6ª Geração',
      'generation-vii': '7ª Geração',
      'generation-viii': '8ª Geração',
      'generation-ix': '9ª Geração'
    }
  },
  en: {
    menu: {
      home: "Home",
      pokedex: "Pokédex",
      items: "Items",
      admin: "Admin",
      login: "Login",
      logout: "Logout"
    },
    carousel: {
      slides: [
        {
          title: "POKÉWIKI",
          subtitle: "WELCOME",
          description: "The largest interactive encyclopedia of Pokémon. Explore all details, statistics and discover new adventures in this incredible universe!",
          price: "HOME"
        },
        {
          title: "CHARIZARD",
          subtitle: "FLAME",
          description: "Spits fire that is hot enough to melt boulders. Known to cause forest fires unintentionally.",
          price: "#0006"
        },
        {
          title: "BLASTOISE",
          subtitle: "TIDE",
          description: "A brutal Pokémon with pressurized water jets on its shell. They are used for high-speed tackles.",
          price: "#0009"
        },
        {
          title: "VENUSAUR",
          subtitle: "FOREST",
          description: "The plant blooms when it is absorbing solar energy. It stays on the move to seek sunlight.",
          price: "#0003"
        }
      ],
      buttons: {
        seeMore: "SEE MORE",
        explore: "Explore Wiki"
      }
    },
    home: {
      exploreTitle: "Explore the Pokémon World",
      exploreSubtitle: "Find detailed information about species, evolutions, abilities and base stats.",
      features: [
        {
          title: "Complete Pokédex",
          description: "Thousands of detailed Pokémon with accurate information and high quality images."
        },
        {
          title: "Quick Management",
          description: "For admins: add, edit or remove Pokémon easily using a modern interface."
        },
        {
          title: "Responsive Design",
          description: "Browse seamlessly on mobile, tablet or desktop with a fluid experience."
        }
      ],
      exploreButton: "Explore Pokédex"
    },
    items: {
      title: "Items",
      subtitle: "List of all items",
      searchPlaceholder: "Search item by name or category...",
      cost: "Cost:",
      category: "Category:",
      noItems: "No items found."
    },
    itemModal: {
      itemNo: "ITEM NO.",
      category: "Category",
      cost: "Cost",
      unbuyable: "Not buyable",
      detailedEffect: "Detailed Effect",
      loading: "Fetching details...",
      error: "Could not load item details."
    },
    filters: {
      search: "Search",
      searchItem: "Search item",
      searchGlobal: "Search Pokémon or Item...",
      allGenerations: "All generations",
      allTypes: "All types",
      anyRarity: "Any rarity",
      allCategories: "All categories",
      sortBy: "Sort by",
      sortAlpha: "Alphabetical",
      sortRarity: "Rarity",
      sortGen: "Generation",
      sortElement: "Elemental",
      sortDefault: "Default",
      showing: "Showing",
      otherOptions: "Other options",
      clearFilters: "Clear filters",
      clear: "Clear",
      seeResults: "See Results",
      generation: "Generation",
      type: "Type",
      rarity: "Rarity",
      order: "Order",
      options: "Options",
      listAlpha: "List alphabetically",
      listRarity: "List by rarity",
      listGen: "List by generation",
      listElement: "List by element",
      showMegas: "Mega evolutions",
      showAlola: "Alola region",
      showGalar: "Galar region",
      showHisui: "Hisui region",
      showPaldea: "Paldea region",
      selected: "selected",
      selectedM: "selected",
      types: "types",
      categories: "categories",
      category: "Category",
      noResults: "No results found.",
      noResultsQuery: "No results for",
      typeMore: "Type at least 2 characters to start searching",
      noPokemon: "No Pokémon found with current filters.",
      clearSearch: "Clear Search",
      noItem: "No item found",
      tryAnother: "Try searching for another term or clear filters."
    },
    rarities: {
      "Comum": "Common",
      "Incomum": "Uncommon",
      "Raro": "Rare",
      "Épico": "Epic",
      "Único": "Unique",
      "Lendário": "Legendary",
      "Mítico": "Mythical"
    },
    itemCategories: {
      "Pokébolas": "Pokéballs",
      "Medicina": "Medicine",
      "Batalha": "Battle",
      "Evolução": "Evolution",
      "Comida": "Food",
      "Chaves e Especiais": "Key & Special",
      "Outros": "Other"
    },
    adminMenu: {
      dashboard: "My Dashboard",
      addPokemon: "Add Pokémon",
      addAdmin: "Add Admins",
      logout: "Logout",
    },
    login: {
      welcome: "Welcome back!",
      subtitle: "Login to manage the Pokédex",
      email: "Email",
      password: "Password",
      enter: "Login",
      entering: "Logging in...",
      errorCredentials: "Incorrect email or password.",
      errorConfirm: "Please confirm your email before logging in.",
      onlyAdmins: "Only people registered by an admin can log in",
    },
    adminPokemon: {
      back: "Back to Dashboard",
      title: "Register Pokémon",
      subtitle: "Add a new Pokémon to the Pokewiki database.",
      name: "Name",
      type: "Type (Max 2)",
      imageUrl: "Image URL",
      weaknesses: "Weaknesses",
      description: "Description",
      save: "Save Pokémon",
      saving: "Saving...",
      errorName: "Enter the Pokémon's name before searching.",
      errorPokeApi: "Error searching in PokéAPI.",
      errorCreate: "Error registering pokemon.",
    },
    adminUsers: {
      title: "Manage Administrators",
      subtitle: "Create new accounts, change permissions and manage access.",
      newAdmin: "New Administrator",
      email: "Account Email",
      role: "Current Role",
      actions: "Actions",
      you: "You",
      loading: "Loading users...",
      noUsers: "No users found.",
      removeAdmin: "Remove Admin",
      makeAdmin: "Make Admin",
      createTitle: "Create New Administrator",
      nameOptional: "Name (Optional)",
      cancel: "Cancel",
      createAccount: "Create Account",
      creating: "Creating...",
      editTitle: "Edit Account",
      newName: "New Name",
      newNamePlaceholder: "Leave blank to keep current",
      newPassword: "New Password",
      newPasswordPlaceholder: "Leave blank to not change",
      saveChanges: "Save Changes",
      saving: "Saving...",
      errorUnknown: "Unknown error",
    },
    pokemonTypes: {
      'Fogo': 'Fire',
      'Água': 'Water',
      'Elétrico': 'Electric',
      'Aço': 'Steel',
      'Luta': 'Fighting',
      'Psíquico': 'Psychic',
      'Escuridão': 'Dark',
      'Normal': 'Normal',
      'Dragão': 'Dragon',
      'Fada': 'Fairy',
      'Gelo': 'Ice',
      'Planta': 'Grass',
      'Venenoso': 'Poison',
      'Terra': 'Ground',
      'Voador': 'Flying',
      'Inseto': 'Bug',
      'Rocha': 'Rock',
      'Fantasma': 'Ghost'
    },
    pokemonGenerations: {
      '1ª Geração (1-151)': '1st Gen (1-151)',
      '2ª Geração (152-251)': '2nd Gen (152-251)',
      '3ª Geração (252-386)': '3rd Gen (252-386)',
      '4ª Geração (387-493)': '4th Gen (387-493)',
      '5ª Geração (494-649)': '5th Gen (494-649)',
      '6ª Geração (650-721)': '6th Gen (650-721)',
      '7ª Geração (722-809)': '7th Gen (722-809)',
      '8ª Geração (810-905)': '8th Gen (810-905)',
      '9ª Geração (906-1025)': '9th Gen (906-1025)'
    },
    pokemonGenerationsShort: {
      'generation-i': '1st Gen',
      'generation-ii': '2nd Gen',
      'generation-iii': '3rd Gen',
      'generation-iv': '4th Gen',
      'generation-v': '5th Gen',
      'generation-vi': '6th Gen',
      'generation-vii': '7th Gen',
      'generation-viii': '8th Gen',
      'generation-ix': '9th Gen'
    }
  }
};
