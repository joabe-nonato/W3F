const bd = document.querySelector('body');
const conteudoMensagem = document.querySelector('#conteudoMensagem');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

let continuar = false;
let larguraLinha = 1;
let prevMouseX;
let prevMouseY;
let snapshot;
let quadroLargura;
let quadroAltura;
let listaQuadros = [];
let tipoSelecionada = -1;
let tipoPergunta = -1;
let listaCombo = [];
let listaColisao = [];
let listaAtaque = [];
let identificacaoSelecionada = 0;

//UPLOAD DE IMAGEM

function uploadImage() {
    const fileInput = document.getElementById('file');
    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    fetch('http://127.0.0.1:5500/site/src/assets/imagens/folha.png', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}



//CARREGAR ARQUIVO JSON
async function RetornarDadosJson(arquivoJson) {
    try {
        const response = await fetch(arquivoJson);
        if (!response.ok) {
            throw new Error('Erro ao carregar o arquivo JSON');
        }
        const dados = await response.json();
        return dados;
    } catch (erro) {
        console.error(erro);
    }
}

const PreencherCombo = () =>{
    let jsnTipoAcoes = document.querySelector('#jsnTipoAcoes');
    let selecione = document.createElement('option');
    selecione.text = "Selecione";
    selecione.value = "0";    
    jsnTipoAcoes.append(selecione);

    RetornarDadosJson('data/acoes.json')
    .then(dados => {        
        listaCombo = Array.from(dados['acoes']);
        
        listaCombo.forEach((item) =>{
            
            let opcao = document.createElement('option');
            opcao.text = item['acao'];
            opcao.value = item['valor'];

            jsnTipoAcoes.append(opcao);
        });
    })
    .catch(erro => {
        console.error(erro);
    });
}

window.addEventListener("load", () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    // let img = new Image();
    // img.src= 'http://127.0.0.1:5500/src/site/assets/imagens/folha.png';
    // ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // Desenha a imagem no canvas
    PreencherCombo();
});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const iniciar = (e) => {

    if(tipoSelecionada == -1){
        bd.classList.add('ativo');
        conteudoMensagem.innerHTML = "Para avançar é preciso selecionar os itens do menu. Deseja proseguir?";
    }
    else{
        continuar = true;

        // Pegar posição do mouse
        prevMouseX = e.offsetX;
        prevMouseY = e.offsetY;
    
        ctx.beginPath();
        ctx.lineWidth = larguraLinha;    
        snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
}

const Aplicar = (e) => {    
    Adicionar(e);
    continuar = false;
}

const desenhar = (e) => {
    if (continuar) {
        quadroLargura = (prevMouseX - e.offsetX);
        quadroAltura = (prevMouseY - e.offsetY);
    
        document.querySelector('#spanX').innerHTML = e.offsetX;
        document.querySelector('#spanY').innerHTML = e.offsetY;
        document.querySelector('#spanW').innerHTML = quadroLargura;
        document.querySelector('#spanH').innerHTML = quadroAltura;    

        ctx.putImageData(snapshot, 0, 0);
        ctx.strokeRect(e.offsetX, e.offsetY, quadroLargura, quadroAltura);
    }
}

const CarregarMenuListaDeQuadros = () => {
    document.querySelector('#listaQuadro').innerHTML = "";

    // Ordenação por id e grupo
    listaQuadros = listaQuadros.sort((valor1, valor2) => {
        if (valor1.grupo === valor2.grupo) {
            // Se os ids forem iguais, ordena pelo grupo
            if (valor1.id > valor2.id) {
                return 1;
            } 
            else 
            {
                return -1;
            }
        } else {
            if (valor1.grupo > valor2.grupo) {
                return 1;
            } else if (valor1.grupo < valor2.grupo) {
                return -1;
            } else {
                return 0;
            }
        }
    });

    listaQuadros.forEach((element, index) => {
        const addLi = document.createElement("li");
        addLi.className = "jsn-item"

        if(element["tipo"] == 0)
            {
                const addTxt = document.createElement("span");
                addTxt.innerHTML = index + ": " + element['descricao'];
                addLi.appendChild(addTxt);                

                const addInputColisao = document.createElement("input");
                addInputColisao.type = "button";
                addInputColisao.id = element["id"];
                addInputColisao.title= "Adicionar Colisão";
                addInputColisao.className = "jsn-add-colisao";
                addLi.appendChild(addInputColisao);
                
                const addInputAtaque = document.createElement("input");
                addInputAtaque.type = "button";
                addInputAtaque.id = element["id"];
                addInputAtaque.title= "Adicionar Ataque";
                addInputAtaque.className = "jsn-add-ataque";
                addLi.appendChild(addInputAtaque);
        
            }
            else{
                
                addLi.className = "jsn-item-grupo"

                const addimg = document.createElement("span");
                addimg.className = "jsn-seta";
                addLi.appendChild(addimg); 

                const addTxt = document.createElement("span");
                if(element["tipo"] == 1)
                {
                    addTxt.innerHTML = index + ": Colisão Peso: "+ element["peso"] ;                    
                }
                else{
                    addTxt.innerHTML = index + ": Ataque";
                }

                addLi.appendChild(addTxt); 
            }

        const addRemove = document.createElement("input");
        addRemove.type = "button";
        addRemove.id = index;
        addRemove.title= "Remover";
        addRemove.className = "jsn-remover";
        addLi.appendChild(addRemove);
        

        document.querySelector('#listaQuadro').append(addLi);
    });

    const removerItem = document.querySelectorAll('.jsn-remover');
    
    removerItem.forEach(item => {
        item.addEventListener("click", removerItemLista);
    });
    
    const addColisao = document.querySelectorAll('.jsn-add-colisao');

    addColisao.forEach(item =>{
        item.addEventListener("click", AdicionarColisao);
    });

    const addAtaque = document.querySelectorAll('.jsn-add-ataque');
    addAtaque.forEach(item =>{
        item.addEventListener("click", AdicionarAtaque);
    });
    
}

// Função para obter o peso de colisão
function obterPesoColisao() {

    if(tipoSelecionada == 1)
    {
        const radioSelecionado = document.querySelector('input[name="colisaoPeso"]:checked');
        if (radioSelecionado) {
            return radioSelecionado.value;
        } else {
            return null;
        }
    }
    else{
        return null;
    }
}

//OBJETO PRINCIPAL
const RetornarQuadro = (e) => {

    let acaoSelecionada = document.querySelector('#jsnTipoAcoes').value;

    let opcaoCombo = listaCombo.filter(f => f.valor == acaoSelecionada)[0];

    let identificacao = parseInt(Date.now());

    let quadro = {
        id: identificacao,
        acao: acaoSelecionada,
        descricao: opcaoCombo["acao"],
        peso: obterPesoColisao(),
        tipo: tipoSelecionada,
        indice: listaQuadros.length,        
        grupo: identificacao,        
        largura: quadroLargura,
        altura: quadroAltura,
        posicaoX: e.offsetX,
        posicaoY: e.offsetY,
        colisoes: listaColisao,
        ataques: listaAtaque
    };    
    
    // console.log(quadro)

    return quadro;
};

const PreencherQuadrosComLista = () => {
    clearCanvas();

    listaQuadros.forEach((registro, index) => {

        ctx.font = '16px Arial'; // Define a fonte e o tamanho do texto

        switch(registro.tipo) {
            case 0:
                ctx.strokeStyle = '#000000';
                ctx.fillStyle = '#000000'; // Define a cor do texto
                break;
            case 1:
                ctx.strokeStyle = '#FF0000'; 
                ctx.fillStyle = '#FF0000'; // Define a cor do texto
                break;
            case 2:
                ctx.strokeStyle = '#00FF00'; 
                ctx.fillStyle = '#00FF00'; // Define a cor do texto
                break;
        }

        // Desenha o retângulo
        ctx.strokeRect(registro.posicaoX, registro.posicaoY, registro.largura, registro.altura);

        if(registro.tipo == 0){
            ctx.fillText(index, registro.posicaoX + (registro.largura /2), (registro.posicaoY + registro.altura - 10)); // Desenha o texto no canvas
        }
        else{
            ctx.fillText(index, registro.posicaoX + (registro.largura /2), (registro.posicaoY + (registro.altura / 2))); // Desenha o texto no canvas                
        }

        
    });
}


// REMOVER ITENS 
const removerItemLista = (e) => {
    const indice = parseInt(e.target.id, 10);
    listaQuadros.splice(indice, 1); // Remove o item pelo índice
    CarregarMenuListaDeQuadros();
    PreencherQuadrosComLista(); // Atualiza o canvas após remover o item
}

const removerTudo = () =>{
    listaQuadros = []
    CarregarMenuListaDeQuadros();
    PreencherQuadrosComLista(); // Atualiza o canvas após remover o item
    tipoSelecionada = -1;
}


// MODAL DE MENSAGENS
const modalFechar = () =>{
    const bd = document.querySelector('body');
    bd.classList.remove('ativo');
    conteudoMensagem.innerHTML = "";
    document.querySelector('#dvPesoColisao').classList.add("ocultar");
    tipoPergunta = -1;
}

const fecharModal = document.querySelectorAll('.fecharModal');
fecharModal.forEach((item)=>{
    item.addEventListener("click", modalFechar);
});

const perguntarLimparTudo = () =>{    
    bd.classList.add('ativo');
    conteudoMensagem.innerHTML = "Deseja Remover Todos os Itens?";
    tipoPergunta = 3;
}

const limparTudo = document.querySelector('#limparTudo');
limparTudo.addEventListener("click", perguntarLimparTudo);

const executarModal = ()=>{

    tipoSelecionada = tipoPergunta;

    switch(tipoSelecionada)
    {
        case 0:
            ctx.strokeStyle = 'black';
            break;
        case 1:
            ctx.strokeStyle = 'red'; // Aqui você pode usar qualquer cor CSS válida            
            break;
        // case 2:
        case 3:
            removerTudo();
            break;
    }

    modalFechar();
}

const modalExecutar = document.querySelector('#modalExecutar');
modalExecutar.addEventListener("click", executarModal);
// FIM MODAL

// ADICIONAR QUADRO
const AdicionarQuadro = () =>{
    bd.classList.add('ativo');
    conteudoMensagem.innerHTML = "Deseja Adicionar Quadro de Imagem?";
    tipoPergunta = 0;
}

const addQuadro = document.querySelector('#addQuadro');
addQuadro.addEventListener("click", AdicionarQuadro);
// FIM - ADICIONAR QUADRO

// ADICIONAR COLISÃO
const AdicionarColisao = (item) =>{
    bd.classList.add('ativo');
    conteudoMensagem.innerHTML = "Deseja Adicionar Colisão?";
    tipoPergunta = 1;

    document.querySelector('#dvPesoColisao').classList.remove("ocultar");

    identificacaoSelecionada = item.target.id;
}

// FIM - ADICIONAR COLISÃO

// ADICIONAR ATAQUE
const AdicionarAtaque = () =>{
    bd.classList.add('ativo');
    conteudoMensagem.innerHTML = "Deseja Adicionar Ataque?";
    tipoPergunta = 2;

    identificacaoSelecionada = item.target.id;
}

// FIM - ADICIONAR ATAQUE



const Adicionar = (e) => {

    // console.log(tipoSelecionada);

    let novoQuadro = RetornarQuadro(e);

   if(tipoSelecionada == 1 || tipoSelecionada === 2){
    novoQuadro.grupo = identificacaoSelecionada;
   }

    listaQuadros.push(novoQuadro);

    CarregarMenuListaDeQuadros();
    PreencherQuadrosComLista(); // Atualiza o canvas após adicionar um novo item
}

canvas.addEventListener("mousedown", iniciar);
canvas.addEventListener("mousemove", desenhar);
canvas.addEventListener("mouseup", Aplicar); // Igual a função "Aplicar"
