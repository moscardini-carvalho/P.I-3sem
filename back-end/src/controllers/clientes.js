import prisma from '../database/client.js'
import { includeRelations } from '../lib/utils.js'

const controller = {}   // Objeto vazio

controller.create = async function(req, res) {
  /* Conecta-se ao BD e envia uma instrução de criação
     de um novo documento, contendo os dados que vieram
     dentro de req.body
  */

     // Exemplo no controller de clientes (ex: src/controllers/clientes.js)
if (req.body.data_nascimento && typeof req.body.data_nascimento === 'string') {
  // Se vier só yyyy-mm-dd, adiciona o horário padrão
  if (/^\d{4}-\d{2}-\d{2}$/.test(req.body.data_nascimento)) {
    req.body.data_nascimento = req.body.data_nascimento + 'T00:00:00.000Z';
  }
}
  try {
    await prisma.cliente.create({ data: req.body })

    // Envia uma mensagem de sucesso ao front-end
    // HTTP 201: Created
    res.status(201).end()
  }
  catch(error) {
    // Deu errado: exibe o erro no terminal
    console.error(error)

    // Envia o erro ao front-end, com status de erro
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.retrieveAll = async function(req, res) {

  const include = includeRelations(req.query)

  try {
    // Manda buscar os dados no servidor de BD
    const result = await prisma.cliente.findMany({
      include,
      orderBy: [ { nome: 'asc' } ]
    })

    // Retorna os dados obtidos ao cliente com o status
    // HTTP 200: OK (implícito)
    res.send(result)
  }
  catch(error) {
    // Deu errado: exibe o erro no terminal
    console.error(error)

    // Envia o erro ao front-end, com status de erro
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.retrieveOne = async function(req, res) {
  try {

    const include = includeRelations(req.query)

    // Manda buscar o documento no servidor de BD
    // usando como critério de busca um id informado
    // no parâmetro da requisição
    const result = await prisma.cliente.findUnique({
      include,
      where: { id: req.params.id }
    })

    // Encontrou o documento ~> retorna HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou o documento ~> retorna HTTP 404: Not Found
    else res.status(404).end()
  }
  catch(error) {
    // Deu errado: exibe o erro no terminal
    console.error(error)

    // Envia o erro ao front-end, com status de erro
    // HTTP 500: Internal Server Error
    res.status(500).send(error)
  }
}

controller.update = async function(req, res) {
  try {
    // Busca o documento pelo id passado como parâmetro e,
    // caso o documento seja encontrado, atualiza-o com as
    // informações passadas em req.body
    await prisma.cliente.update({
      where: { id: req.params.id },
      data: req.body
    })

    // Encontrou e atualizou ~> retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    // P2025: erro do Prisma referente a objeto não encontrado
    if(error?.code === 'P2025') {
      // Não encontrou e não alterou ~> retorna HTTP 404: Not Found
      res.status(404).end()
    }
    else {    // Outros tipos de erro
      // Deu errado: exibe o erro no terminal
      console.error(error)

      // Envia o erro ao front-end, com status de erro
      // HTTP 500: Internal Server Error
      res.status(500).send(error)
    }
  }
}

controller.delete = async function(req, res) {
  try {
    // 1. Encontrar e deletar os pedidos relacionados a este cliente
    await prisma.pedido.deleteMany({
      where: { cliente_id: req.params.id }
    });

    // 2. Agora que os pedidos foram deletados, deletar o cliente
    await prisma.cliente.delete({
      where: { id: req.params.id }
    });

    res.status(204).end(); // Sucesso: No Content
  }
  catch(error) {
    if(error?.code === 'P2025') {
      // Cliente não encontrado para deletar
      res.status(404).end();
    }
    else {
      // Outros erros
      console.error(error);
      res.status(500).send(error);
    }
  }
}

export default controller