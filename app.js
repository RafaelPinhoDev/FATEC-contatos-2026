'use strict'

import { preview } from "./preview.js"
import { getContatos, criarContato, atualizarContato, deletarContato } from "./contatos.js"

// Adiciona ou Edita o Formulário
async function cadastrarEditarForm(evento) {

    // O prevent default impede que a página resete.
    evento.preventDefault();
   
    const id = document.getElementById('id').value
    const arquivoFoto = document.getElementById('preview-input').files[0]

    const dadosContato = {
        nome: document.getElementById('nome').value,
        celular: document.getElementById('celular').value,
        foto: document.getElementById('foto').value,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value,
        cidade: document.getElementById('cidade').value
    }



    // Se o usuário selecionou uma imagem nova no input de arquivo
    if (arquivoFoto) {
        const lerArquivo = (arquivo) => {
            return new Promise((resolve, reject) => {
                const leitor = new FileReader()
                leitor.onload = (e) => resolve(e.target.result)
                leitor.onerror = (e) => reject(e)
                leitor.readAsDataURL(arquivo)
            })
        }

        try {
            dadosContato.foto = await lerArquivo(arquivoFoto);
        } catch (erro) {
            console.error("Erro ao ler a imagem:" + erro.message);
        }
    }

    try {
        if (id) {
            await atualizarContato(id, dadosContato)
            alert("Contato Atualizado")
        } else {
            await criarContato(dadosContato)
            alert("Cadastro salvo")
        }
        window.location.href = 'index.html'
    } catch (erro) {
        console.error(erro)
        alert("Erro ao acessar API: " + erro.message)
    }
}


// Função para criar a estrutura do contato
function criarEstruturaContato(contato) {
    const listaContatos = document.getElementById('lista-contatos')

    const card = document.createElement('div')
    card.classList.add('card')

    const idInterface = document.createElement('span')
    idInterface.textContent = `Id: ${contato.id}`
    idInterface.classList.add('id-pequeno')


    const imagem = document.createElement('img')

    // Carrega uma foto padrão se não tiver foto de perfil
    if (contato.foto === ""){
        imagem.src = "./img/sem-foto.png"
    }else{
        imagem.src = contato.foto
    }
    imagem.alt = contato.nome

    const nome = document.createElement('h3')
    nome.textContent = contato.nome
    nome.classList.add('titulo-card', 'mt-2')

    const celular = document.createElement('p')
    celular.textContent = `Celular: ${contato.celular}`

    const endereco = document.createElement('p')
    endereco.textContent = `Endereço: ${contato.endereco}`

    const cidade = document.createElement('p')
    cidade.textContent = `Cidade: ${contato.cidade}`

    // Criação do botão editar
    const btnEditar = document.createElement('button')
    btnEditar.textContent = 'Editar'
    btnEditar.classList.add('btn', 'btn-warning', 'mt-2')

    // Conecta o botão com a funcao de editar
    btnEditar.onclick = () => editarContato(contato.id) 

    // Criacão do Botão excluir
    const btnExcluir = document.createElement('button')
    btnExcluir.textContent = 'Excluir'
    btnExcluir.classList.add('btn', 'btn-danger', 'mt-2')

    btnExcluir.onclick = () => excluirContato(contato.id, coluna)
    

    const infoContainer = document.createElement('div')
    infoContainer.classList.add('info-container')
    infoContainer.append(nome, celular, endereco, cidade)

    const btnGroup = document.createElement('div')
    btnGroup.classList.add('btn-group-custom')
    btnGroup.append(btnEditar, btnExcluir)


    card.append(imagem, idInterface, infoContainer, btnGroup)

    const coluna = document.createElement('div')
    coluna.classList.add('col-12', 'col-sm-6', 'col-lg-3', 'mb-4')
    coluna.id = `card-${contato.id}`

    card.append(imagem, idInterface, nome, celular, endereco, cidade, btnEditar, btnExcluir)
    coluna.appendChild(card)
    listaContatos.appendChild(coluna)
}



async function carregarContatos() {

    const inputBusca = document.getElementById('input-contato').value.toLowerCase()
    const listaContatos = document.getElementById('lista-contatos')

    if (!listaContatos) return

    // Filtra as buscas e vai pesquisando por aproximação
    try {
        let contatos = await getContatos() 

        if (inputBusca !== "") {
            contatos = contatos.filter(contato => 
                contato.nome.toLowerCase().includes(inputBusca)
            )
        }

        listaContatos.replaceChildren()

        if (contatos.length === 0) {
            listaContatos.innerHTML = `<p class="text-center w-100">Nenhum contato encontrado.</p>`
            return
        }

        contatos.forEach(contato => {
            criarEstruturaContato(contato);
        })

    } catch (erro) {
        console.error("Erro ao acessar API" + erro.message)
    }
}

// Função de editar contato
function editarContato(id) {
    window.location.href = `cadastro.html?id=${id}`
}


// Função de excluir contato
async function excluirContato(id) {
    const confirmar = confirm("Deseja realmente excluir?")
    if (confirmar) {
        try {
            await deletarContato(id)
            carregarContatos()
        } catch (erro) {
            alert("Erro ao excluir: " + erro.message)
        }
    }
}

// Preencher as informações do form ao editar
async function preencherFormulario(id) {
    try {
        const contatos = await getContatos()
        const contato = contatos.find(contato => contato.id == id)

        if (contato) {
            document.getElementById('id').value = contato.id
            document.getElementById('nome').value = contato.nome
            document.getElementById('celular').value = contato.celular
            document.getElementById('foto').value = contato.foto
            document.getElementById('email').value = contato.email
            document.getElementById('endereco').value = contato.endereco
            document.getElementById('cidade').value = contato.cidade

            const titulo = document.querySelector('h1')
            if (titulo) titulo.textContent = "Editar Contato"

            // Função pra mudar pra imagem atual ao editar
            const imgPreview = document.getElementById('preview-image')
            if (imgPreview && contato.foto) {
                imgPreview.src = contato.foto 
            }
            
            const btnSalvar = document.getElementById('cadastrar')
            if (btnSalvar) btnSalvar.textContent = "Atualizar Contato"
        }
    } catch (erro) {
        console.error(erro)
    }
}


function limparFoto() {

    const previewImage = document.getElementById('preview-image')
    const inputHiddenFoto = document.getElementById('foto')
    const inputFileInput = document.getElementById('preview-input')

    if (previewImage) {
        previewImage.src = "./img/upload-icon.svg"
    }
    
    if (inputHiddenFoto) {
        inputHiddenFoto.value = ""
    }


    if (inputFileInput) {
        inputFileInput.value = ""
    }
    
    alert("Visualização da foto resetada.")
}

// -------------------------------------------

// ------------ Botões -----------------------


// 1. Captura o ID da URL (ex: cadastro.html?id=10) - implementado com IA
const urlParams = new URLSearchParams(window.location.search)
const idParaEditar = urlParams.get('id')

// 2. Se existir um ID na URL, significa que viemos do botão "Editar" - IA
if (idParaEditar && document.getElementById('form-cadastro')) {
    preencherFormulario(idParaEditar)
}


// Botão de cadastrar e editar contato
const form = document.getElementById('form-cadastro')
if (form) {
    form.addEventListener('submit', cadastrarEditarForm)
}
// Carregar contatos
document.getElementById('pesquisar')?.addEventListener('click', carregarContatos)

if (document.getElementById('lista-contatos')) {
    document.addEventListener('DOMContentLoaded', carregarContatos)
}

const btnLimparFoto = document.getElementById('limpar-foto')
// O if ér usado como método de segurança quando se trabalha com muitas paginas em um so script para evitar erros
if (btnLimparFoto) {
    btnLimparFoto.addEventListener('click', limparFoto)
}

// Trocar foto do preview
document.getElementById('preview-input').addEventListener('change', preview)