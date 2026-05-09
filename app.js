'use strict'

import { preview } from "./preview.js"
import { getContatos, criarContato, atualizarContato, deletarContato } from "./contatos.js"




async function cadastrarEditarForm(evento) {

    // O prevent default impede que a página resete.
    evento.preventDefault();

    const id = document.getElementById('id').value
    const arquivoFoto = document.getElementById('preview-input').files[0]; 

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
        // Criamos uma Promessa para ler o arquivo e esperar ele terminar
        const lerArquivo = (arquivo) => {
            return new Promise((resolve, reject) => {
                const leitor = new FileReader();
                leitor.onload = (e) => resolve(e.target.result);
                leitor.onerror = (e) => reject(e);
                leitor.readAsDataURL(arquivo);
            });
        };

        try {
            // Sobrescreve o campo foto com a string da imagem real (Base64)
            dadosContato.foto = await lerArquivo(arquivoFoto);
        } catch (erro) {
            console.error("Erro ao ler a imagem:", erro);
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

function editarContato(id) {
    window.location.href = `cadastro.html?id=${id}`
}

async function excluirContato(id, elementoParaRemover) {
    const confirmar = confirm("Deseja realmente excluir?")
    if (confirmar) {
        try {
            await deletarContato(id)
            if (elementoParaRemover) elementoParaRemover.remove()
        } catch (erro) {
            alert("Erro ao excluir: " + erro.message)
        }
    }
}

function criarEstruturaContato(contato) {
    const listaContatos = document.getElementById('lista-contatos')

    const card = document.createElement('div')
    card.classList.add('card')

    const idInterface = document.createElement('span')
    idInterface.textContent = `Id: ${contato.id}`
    idInterface.classList.add('id-pequeno')

    const imagem = document.createElement('img')
    imagem.src = contato.foto
    imagem.alt = contato.nome

    const nome = document.createElement('h3')
    nome.textContent = contato.nome
    nome.classList.add('titulo-card')

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
    

    // 1. Crie um container para as informações
    const infoContainer = document.createElement('div')
    infoContainer.classList.add('info-container')
    infoContainer.append(nome, celular, endereco, cidade)

    // 2. Crie um container para os botões
    const btnGroup = document.createElement('div')
    btnGroup.classList.add('btn-group-custom')
    btnGroup.append(btnEditar, btnExcluir)

    // 3. Monte o card na ordem certa
    card.append(imagem, idInterface, infoContainer, btnGroup)

    const coluna = document.createElement('div')
    coluna.classList.add('col-12', 'col-sm-6', 'col-lg-3', 'mb-4')
    coluna.id = `card-${contato.id}`

    card.append(imagem, idInterface, nome, celular, endereco, cidade, btnEditar, btnExcluir)
    coluna.appendChild(card)
    listaContatos.appendChild(coluna)
}

async function carregarContatos() {
    const inputBusca = document.getElementById('input-contato')
    const buscaTexto = inputBusca ? inputBusca.value.toLowerCase() : ""
    const listaContatos = document.getElementById('lista-contatos')

    if (!listaContatos) return

    try {
        let contatos = await getContatos() 

        if (buscaTexto !== "") {
            contatos = contatos.filter(contato => 
                contato.nome.toLowerCase().includes(buscaTexto)
            )
        }

        listaContatos.innerHTML = ""

        if (contatos.length === 0) {
            listaContatos.innerHTML = `<p class="text-center w-100">Nenhum contato encontrado.</p>`
            return
        }

        contatos.forEach(contato => {
            criarEstruturaContato(contato);
        })

    } catch (erro) {
        console.error("Erro ao acessar API", erro)
    }
}

async function preencherFormulario(id) {
    try {
        const contatos = await getContatos()
        const contato = contatos.find(c => c.id == id)

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
            
            const btnSalvar = document.getElementById('cadastrar')
            if (btnSalvar) btnSalvar.textContent = "Atualizar Contato"
        }
    } catch (erro) {
        console.error(erro)
    }
}

// 1. Captura o ID da URL (ex: cadastro.html?id=10)
const urlParams = new URLSearchParams(window.location.search)
const idParaEditar = urlParams.get('id')

// 2. Se existir um ID na URL, significa que viemos do botão "Editar"
if (idParaEditar && document.getElementById('form-cadastro')) {
    preencherFormulario(idParaEditar)
}

// Botão de cadastrar e editar contato
const form = document.getElementById('form-cadastro')
if (form) {
    form.addEventListener('submit', cadastrarEditarForm)
}

document.getElementById('pesquisar')?.addEventListener('click', carregarContatos)

if (document.getElementById('lista-contatos')) {
    document.addEventListener('DOMContentLoaded', carregarContatos)
}

document.getElementById('preview-input').addEventListener('change', preview);