const bd = document.querySelector('body');
const conteudoMensagem = document.querySelector('#conteudoMensagem');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext("2d");

let continuar = false;
let larguraLinha = 2;
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

const pausar = (e) => {    
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

const CarregarListaDeQuadros = () => {
    document.querySelector('#listaQuadro').innerHTML = "";

    listaQuadros.forEach((element, index) => {
        const addLi = document.createElement("li");
        addLi.className = "jsn-item"

        const addTxt = document.createElement("span");
        addTxt.innerHTML = index + ": " + element['descricao'];
        addLi.appendChild(addTxt);        

        const addInputColisao = document.createElement("input");
        addInputColisao.type = "button";
        addInputColisao.id = index;
        addInputColisao.title= "Adicionar Colisão";
        addInputColisao.className = "jsn-add-colisao";
        addLi.appendChild(addInputColisao);
        
        const addInputAtaque = document.createElement("input");
        addInputAtaque.type = "button";
        addInputAtaque.id = index;
        addInputAtaque.title= "Adicionar Ataque";
        addInputAtaque.className = "jsn-add-ataque";
        addLi.appendChild(addInputAtaque);

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

    let opcaoCombo = listaCombo.filter(f => f.valor == document.querySelector('#jsnTipoAcoes').value)[0];

    grupo = (listaQuadros.length + 1);        

    let quadro = {
        acao: document.querySelector('#jsnTipoAcoes').value,
        descricao: opcaoCombo["acao"],
        peso: obterPesoColisao(),
        tipo: tipoSelecionada,
        indice: listaQuadros.length,        
        grupo: grupo,        
        largura: quadroLargura,
        altura: quadroAltura,
        posicaoX: e.offsetX,
        posicaoY: e.offsetY,
        colisoes: listaColisao,
        ataques: listaAtaque
    };    
    
    console.log(quadro)

    return quadro;
};

const PreencherComLista = () => {
    clearCanvas();

    listaQuadros.forEach(registro => {

        switch(registro.tipo)
    {
        case 0:
            ctx.strokeStyle = '#000000';
            break;
        case 1:
            ctx.strokeStyle = '#FF0000'; 
            break;
        case 2:
            ctx.strokeStyle = '#00FF00'; 
            break;
    }


        ctx.strokeRect(registro.posicaoX, registro.posicaoY, registro.largura, registro.altura);
    });
}

// REMOVER ITENS 
const removerItemLista = (e) => {
    const indice = parseInt(e.target.id, 10);
    listaQuadros.splice(indice, 1); // Remove o item pelo índice
    CarregarListaDeQuadros();
    PreencherComLista(); // Atualiza o canvas após remover o item
}

const removerTudo = () =>{
    listaQuadros = []
    CarregarListaDeQuadros();
    PreencherComLista(); // Atualiza o canvas após remover o item
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

}

// FIM - ADICIONAR COLISÃO

// ADICIONAR ATAQUE
const AdicionarAtaque = () =>{
    bd.classList.add('ativo');
    conteudoMensagem.innerHTML = "Deseja Adicionar Ataque?";
    tipoPergunta = 2;
}

// FIM - ADICIONAR ATAQUE



const Adicionar = (e) => {
    let novoQuadro = RetornarQuadro(e);

    listaQuadros.push(novoQuadro);

    CarregarListaDeQuadros();
    PreencherComLista(); // Atualiza o canvas após adicionar um novo item
}

canvas.addEventListener("mousedown", iniciar);
canvas.addEventListener("mousemove", desenhar);
canvas.addEventListener("mouseup", pausar); // Igual a função "pausar"
