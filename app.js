import { getContatos, criarContato, atualizarContato, deletarContato  } from "./contatos.js"


async function cadastrarContato(evento) {

    // O prevent default impede que a página resete.
    evento.preventDefault();

    const novoContato = {
        nome: document.getElementById('nome').value,
        celular: document.getElementById('celular').value,
        foto: document.getElementById('foto').value,
        email: document.getElementById('email').value,
        endereco: document.getElementById('endereco').value,
        cidade: document.getElementById('cidade').value
    }

    
    
    try {
        await criarContato(novoContato)
        alert("Cadastro salvo")
        document.getElementById('form-cadastro').reset()

    }catch(erro){
        alert("Erro ao salvar contato: ", erro)
    }
    

}


document.getElementById('form-cadastro').addEventListener('submit', cadastrarContato)