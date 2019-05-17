require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const request = require("request-promise");

const app = express();
const PORT = 3000;

app.listen(process.env.PORT || PORT, function() {
  console.log('Bot is listening on port ' + PORT);
});

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const optionChurrasco = {
  'descricao' : 'Churrasco (Medalhão, Noix e Linguiça)',
  'acompanhamento' : {
    1: 'Mandioca Cozida',
    2: 'Fritas'
  }
};
const saladas = {
  1: 'Salada',
  2: 'Vinagrete'
}

const cardapioCompleto = {
  0: {
    1: optionChurrasco
  },
  1: {
    1: optionChurrasco,
    2: {
      'descricao': 'Frango Grelhado',
      'acompanhamento': {
        1: 'Legumes na Manteiga',
        2: 'Batata Souté'
      }
    },
    3: {
      'descricao': 'Ragu (Legumes, Tomate e Vinho) Bovino',
      'acompanhamento' : {
        1: 'Farofa e Polenta',
        2: 'Penne ao Sugo'
      }
    },
    4: {
      'descricao': 'Copa de Lombo Suíno Grelhado', 
      'acompanhamento' : {
        1: 'Farofa, Ovo Frito e Couve',
        2: 'Fritas'
      }
    }
  },
  2: {
    1: optionChurrasco,
    2: {
      'descricao' : 'Estrogonoff',
      'acompanhamento' : {
        1: 'Batata Palha',
        2: 'Fritas'
      }
    },
    3: {
      'descricao' : 'Isca de Contra Filet acebolado',
      'acompanhamento' : {
        1: 'Caneloni de Presunto e Queijo',
        2: 'Batata Souté'
      }
    },
    4: {
      'descricao' : 'Isca de Lombo Suíno Acebolado com Barbecue',
      'acompanhamento' : {
        1 : 'Purê de Batata Doce',
        2 : 'Batata Souté'
      }
    }
  },
  3: {
    1: optionChurrasco,
    2: {
      'descricao': 'Isca de Frango ao Sugo',
      'acompanhamento': {
        1: 'Polenta',
        2: 'Purê de Batata Doce'
      }
    },
    3: {
      'descricao': 'Carne Panela',
      'acompanhamento': {
        1: 'Farofa e Polenta',
        2: 'Purê de Mandioca com Provolone'
      }
    },
    4: {
      'descricao': 'Bisteca',
      'acompanhamento': {
        1: 'Caneloni de Presunto e Queijo',
        2: 'Ovo Frito e Couve'
      }
    }
  },
  4: {
    1: optionChurrasco,
    2: {
      'descricao': 'Frango Grelhado',
      'acompanhamento': {
        1: 'Caneloni de Presunto e Queijo',
        2: 'Batata Souté'
      }
    },
    3: {
      'descricao': 'Isca de Contra Filet com Legumes',
      'acompanhamento': {
        1: 'Purê de Batata',
        2: 'Fritas'
      }
    },
    4: {
      'descricao': 'Linguiça de Pernil Grelhada',
      'acompanhamento': {
        1: 'Ovo Frito e Couve com Bacon',
        2: 'Fritas'
      }
    },
    5: {
      'descricao': 'Panqueca de Frango',
      'acompanhamento': {
        1: 'Batata Palha',
        2: 'Fritas'
      }
    }
  },
  5: {
    1: optionChurrasco,
    2: {
      'descricao': 'Isca de Frango 4 Queijos',
      'acompanhamento': {
        1: 'Penne Alho e Óleo',
        2: 'Legumes na Manteiga'
      }
    },
    3: {
      'descricao': 'Contra Filet Grelhado',
      'acompanhamento': {
        1: 'Legumes na Manteiga',
        2: 'Fritas'
      }
    },
    4: {
      'descricao': 'Leitoa à Passarinho',
      'acompanhamento': {
        1: 'Farofa e Mandioca Cozida',
        2: 'Purê de Batata Doce'
      }
    },
  },
  6: {
    1: optionChurrasco
  },
  'saladas': saladas
}

let mini = [];
let media = [];
let grande = [];

let lastUpdate = new Date().toDateString();

var invalidChannel = 'Comando válido apenas no canal #marmita';

app.post('/limpar', function(req, res) {
  if (!checkChannel(req.body.channel_id)) {
    res.send(invalidChannel);
    return;
  }
  mini = [];
  media = [];
  grande = [];
  res.send({
    'response_type' : 'in_channel', 
    'text' : 'A Lista de Pedidos foi limpa'
  });  
});

app.post('/finalizar', async function(req, res) {
  if (!checkChannel(req.body.channel_id)) {
    res.send(invalidChannel);
    return;
  }

  res.send({
    'response_type' : 'in_channel', 
    'text' : 'Segue a lista de pedidos: \n\n' + await generateList()
  });
  
});

app.post('/excluir', async function(req, res) {  
  if (req.body.text == '') {
    let msg = 'Digite o nome da Pessoa conforme foi adicionado na lista';

    res.send(msg);
    return;
  }

  name = req.body.text;

  let msg = "Pedido do(a) " + name + " foi excluído.\n\n";
  msg += generateList();

  if (mini[name]) {
    mini = mini.filter(function(value, index, arr) {
      return index != name;
    });
    res.send(msg);
    return;
  }

  if (media[name]) {
    media = media.filter(function(value, index, arr) {
      return index != name;
    });
    res.send(msg);
    return;
  }

  if (grande[name]) {
    grande = grande.filter(function(value, index, arr) {
      return index != name;
    });
    res.send(msg);
    return;
  }

  msg = "Pedido do(a) " + name + " não encontrado.";
  res.send(msg);
  return;
});

app.post('/pedir/amigo', async function(req, res) {  
  if (req.body.text == '') {
    let msg = "Para visualizar o cardápio, digite `/cardapio`. \n\n";
    msg += 'Para adicionar um pedido, basta digitar `/pedir-amigo <nomeDoAmigo> #<numeroDoPedido>`, onde o numeroDoPedido é composto por 3 dígitos.';
    msg += 'O primeiro digito é a mistura, o segundo o acompanhamento e o terceiro é a salada. \n\n'
    msg += 'Exemplo: `/pedir-amigo João #122`\n\n\n'
    msg += 'Esse comando vai fazer o pedido de Churrasco (Medalhão, Noix e Linguiça) com Fritas + Vinagrete\n\n';
    msg += 'Se tiver alguma observação, ou algum pedido diferente do que é apresentado pelo comando `/cardapio` '
    msg += 'é só digitar `/pedir-amigo <nomeDoAmigo>` seguido do seu pedido\n\n';
    msg += 'Exemplo: `/pedir-amigo João Churrasco SEM FEIJÃO com Fritas e SEM SALADA`\n\n\n'
    res.send(msg);
    return;
  }

  if (!checkChannel(req.body.channel_id)) {
    res.send(invalidChannel);
    return;
  }

  if (new Date().toDateString() != lastUpdate) {
    mini = [];
    media = [];
    grande = [];

    lastUpdate = new Date().toDateString();
  }

  let userName = req.body.text.split(" ")[0];
  let pedido = req.body.text.substr(userName.length + 1);

  if (pedido == undefined || pedido == '') {
    res.send('Nenhum pedido feito para o ' + userName + '. Por favor, digite novamente. Qualquer dúvida digite apenas `/pedir-amigo` para uma explicação mais detalhada.');
    return;
  }

  // let weekDay = 2;
  let weekDay = new Date().getDay();
  let row;

  if (pedido.charAt(0) == '#') {

    let mistura = pedido.charAt(1);
    let acompanhamento = pedido.charAt(2);
    let salada = pedido.charAt(3);

    if (isNaN(mistura) || isNaN(acompanhamento) || isNaN(salada)) {
      res.send("Opção inválida. Caso tenha dúvidas, digite `/cardapio` para verificar as opções disponíveis do dia.");
      return;
    }

    if (!cardapioCompleto[weekDay].hasOwnProperty(mistura)
    || !cardapioCompleto[weekDay][mistura].hasOwnProperty('acompanhamento')
    || !cardapioCompleto['saladas'].hasOwnProperty(salada)) {
      res.send("Opção inválida. Caso tenha dúvidas, digite `/cardapio` para verificar as opções disponíveis do dia.");
      return;
    }

    row = userName + ": " + cardapioCompleto[weekDay][mistura]['descricao'];
    row += ' com ' + cardapioCompleto[weekDay][mistura]['acompanhamento'][acompanhamento];
    row += ' + ' + cardapioCompleto['saladas'][salada];

    mini[userName] = row;
  } else {
    row = userName + ": " + pedido;

    mini[userName] = row;
  }

  var data = {
    'response_type' : 'in_channel', 
    'text' : await generateList()
  };
  res.send(data);

  lastUpdate = new Date().toDateString();
});

app.post('/pedir', async function(req, res) {  

  if (req.body.text == '') {
    let msg = "Para visualizar o cardápio, digite `/cardapio`. \n\n";
    msg += 'Para adicionar um pedido, basta digitar `/pedir #<numeroDoPedido>`, onde o numeroDoPedido é composto por 3 dígitos.';
    msg += 'O primeiro digito é a mistura, o segundo o acompanhamento e o terceiro é a salada. \n\n'
    msg += 'Exemplo: `/pedir #122`\n\n\n'
    msg += 'Esse comando vai fazer o pedido de Churrasco (Medalhão, Noix e Linguiça) com Fritas + Vinagrete\n\n';
    msg += 'Se tiver alguma observação, ou algum pedido diferente do que é apresentado pelo comando `/cardapio` '
    msg += 'é só digitar `/pedir` seguido do seu pedido (não é necessário informar seu nome)\n\n';
    msg += 'Exemplo: `/pedir Churrasco SEM FEIJÃO com Fritas e SEM SALADA`\n\n\n'
    res.send(msg);
    return;
  }

  if (!checkChannel(req.body.channel_id)) {
    res.send(invalidChannel);
    return;
  }

  if (new Date().toDateString() != lastUpdate) {
    mini = [];
    media = [];
    grande = [];

    lastUpdate = new Date().toDateString();
  }

  let userName = await getUserName(req.body.user_id);
  // let weekDay = 2;
  let weekDay = new Date().getDay();
  let row;

  if (req.body.text.charAt(0) == '#') {

    let mistura = req.body.text.charAt(1);
    let acompanhamento = req.body.text.charAt(2);
    let salada = req.body.text.charAt(3);

    if (isNaN(mistura) || isNaN(acompanhamento) || isNaN(salada)) {
      res.send("Opção inválida. Caso tenha dúvidas, digite `/cardapio` para verificar as opções disponíveis do dia.");
      return;
    }

    if (!cardapioCompleto[weekDay].hasOwnProperty(mistura)
    || !cardapioCompleto[weekDay][mistura].hasOwnProperty('acompanhamento')
    || !cardapioCompleto['saladas'].hasOwnProperty(salada)) {
      res.send("Opção inválida. Caso tenha dúvidas, digite `/cardapio` para verificar as opções disponíveis do dia.");
      return;
    }

    row = userName + ": " + cardapioCompleto[weekDay][mistura]['descricao'];
    row += ' com ' + cardapioCompleto[weekDay][mistura]['acompanhamento'][acompanhamento];
    row += ' + ' + cardapioCompleto['saladas'][salada];

    mini[userName] = row;
  } else {
    row = userName + ": " + req.body.text;

    mini[userName] = row;
  }

  var data = {
    'response_type' : 'in_channel', 
    'text' : await generateList()
  };
  res.send(data);

  lastUpdate = new Date().toDateString();
});

app.post('/cardapio', (req, res) => {
  res.send('O cardápio de *' + getWeekDayName() + '* é: \n\n```' + getDayMenu() + '```');
});

function checkChannel(channel_id) {
  if (channel_id == 'CJ30M228K') {
    return true;
  }

  return false;
}

function getWeekDayName() {
  switch(new Date().getDay()) {
    case 0: 
      return 'Domingo';
    case 1: 
      return 'Segunda-feira';
    case 2: 
      return 'Terça-feira';
    case 3: 
      return 'Quarta-feira';
    case 4: 
      return 'Quinta-feira';
    case 5: 
      return 'Sexta-feira';
    case 6: 
      return 'Sábado';
    default : return '';
  }
}

function getDayMenu() {
  let menu = '';
  // let weekDay = 2;
  let weekDay = new Date().getDay();
  for(var option in cardapioCompleto[weekDay]) {
    menu += "\n#" + option + ": " + cardapioCompleto[weekDay][option]['descricao'];
    if (cardapioCompleto[weekDay][option].hasOwnProperty('acompanhamento')) {
      // menu += '\n';
      for(var optionAcompanhamento in cardapioCompleto[weekDay][option]['acompanhamento']) {
        menu += '\n   #' + optionAcompanhamento + ': ' + cardapioCompleto[weekDay][option]['acompanhamento'][optionAcompanhamento];
      }
    }
  }

  menu += '\n\nNão se esqueça de adicionar a salada no fim do pedido: ';
  menu += '\n   #1: Salada';
  menu += '\n   #2: Vinagrete';

  return menu;
  
}

async function getUserName(userId) {
  url = 'https://slack.com/api/users.info';
  url += '?token=' + process.env.SLACK_AUTH_TOKEN;
  url += '&user=' + userId;
  
  var response = await request.get(url, {json:true});

  if (response.ok) {
    if (response.user.profile.display_name.length > 0) {
      return response.user.profile.display_name;
    }
    return response.user.profile.real_name;
  }
  return '';
}

async function generateList() {
  let fullList = '```';
  if (Object.keys(mini).length > 0) {
    fullList += 'MINI: \n\n'
    for (key in mini) {
      fullList += mini[key] + '\n';
    }
  }

  if (Object.keys(media).length > 0) {
    fullList += 'MÉDIA: \n\n'
    for (key in media) {
      fullList += media[key] + '\n';
    }
  }

  if (Object.keys(grande).length > 0) {
    fullList += 'GRANDE: \n\n'
    for (key in grande) {
      fullList += grande[key] + '\n';
    }
  }

  fullList += '```';
  return fullList;
}