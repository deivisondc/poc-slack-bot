

class PedidoController {

    constructor() {

    }

    pedir(body, lastUpdate) {
        checkPedirEmptyText(body.text);
        checkChannel(body.channel_id);
        checkLastUpdate();
        
        let userName = await getUserName(body.user_id);
        // let weekDay = 2;
        let weekDay = new Date().getDay();
        let row;
    
        if (body.text.charAt(0) == '#') {
            let mistura = body.text.charAt(1);
            let acompanhamento = body.text.charAt(2);
            let salada = body.text.charAt(3);
        
            checkPedidoProntoNaN();
            checkValidMenu();
        
            row = userName + ": " + cardapioCompleto[weekDay][mistura]['descricao'];
            row += ' com ' + cardapioCompleto[weekDay][mistura]['acompanhamento'][acompanhamento];
            row += ' + ' + cardapioCompleto['saladas'][salada];
        
            mini[userName] = row;
        } else {
            row = userName + ": " + body.text;
        
            mini[userName] = row;
        }
    
        var data = {
            'response_type' : 'in_channel', 
            'text' : await generateList()
        };
        res.send(data);
        
        lastUpdate = new Date().toDateString();
    }

    checkPedirEmptyText(text) {
        if (text == '') {
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
    }

    checkChannel(channel_id) {
        if (channel_id != 'CJ30M228K') {
            res.send(invalidChannel);
            return;
        }
    }

    checkLastUpdate(lastUpdate) {
        if (new Date().toDateString() != lastUpdate) {
            mini = [];
            media = [];
            grande = [];
        
            lastUpdate = new Date().toDateString();
        }
    }

    checkPedidoProntoNaN() {
        if (isNaN(mistura) || isNaN(acompanhamento) || isNaN(salada)) {
            res.send("Opção inválida. Caso tenha dúvidas, digite `/cardapio` para verificar as opções disponíveis do dia.");
            return;
        }
    }

    checkValidMenu() {
        if (!cardapioCompleto[weekDay].hasOwnProperty(mistura)
            || !cardapioCompleto[weekDay][mistura].hasOwnProperty('acompanhamento')
            || !cardapioCompleto['saladas'].hasOwnProperty(salada)) {
              res.send("Opção inválida. Caso tenha dúvidas, digite `/cardapio` para verificar as opções disponíveis do dia.");
              return;
        }
    }

    async getUserName(userId) {
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

    async generateList() {
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

}