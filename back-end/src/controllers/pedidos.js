import prisma from '../database/client.js'
import { includeRelations } from '../lib/utils.js'

const controller = {}   // Objeto vazio

controller.create = async function(req, res) {
  /* Conecta-se ao BD e envia uma instrução de criação
     de um novo documento, contendo os dados que vieram
     dentro de req.body
  */
  try {
    await prisma.pedido.create({ data: req.body })

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
    const result = await prisma.pedido.findMany({
      include,
      orderBy: [ { num_pedido: 'asc' } ]
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
    const result = await prisma.pedido.findUnique({
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
    await prisma.pedido.update({
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
    // Busca o documento a ser excluído pelo id passado
    // como parâmetro e efetua a exclusão, caso encontrado
    await prisma.pedido.delete({
      where: { id: req.params.id }
    })

    // Encontrou e excluiu ~> retorna HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    // P2025: erro do Prisma referente a objeto não encontrado
    if(error?.code === 'P2025') {
      // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
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

/*----------------------------------------------------------------*/

controller.createItem = async function(req, res) {
  try {
    // Adiciona no corpo da requisição o item do pedido,
    // passada como parâmetro na rota
    req.body.pedido_id = req.params.id

    await prisma.itemPedido.create({ data: req.body })

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

controller.retrieveAllItems = async function(req, res) {
  try {
    const include = includeRelations(req.query)

    const result = await prisma.itemPedido.findMany({
      where: { pedido_id: req.params.id },
      orderBy: [ { num_item: 'asc' } ],
      include
    })

    // HTTP 200: OK
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

controller.retrieveOneItem = async function(req, res) {
  try {
    /*
      A rigor, o item do pedido poderia ser encontrado apenas pelo seu id.
      No entanto, para forçar a necessidade de um item ao pedido correspondente,
      a busca é feita usando-se tanto o id do item quanto o id do pedido.
    */
    const result = await prisma.itemPedido.findFirst({
      where: {
        id: req.params.itemId,
        pedido_id: req.params.id
      }
    })

    // Encontrou o documento ~> HTTP 200: OK (implícito)
    if(result) res.send(result)
    // Não encontrou ~> HTTP 404: Not Found
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

controller.updateItem = async function(req, res) {
  try {
    await prisma.itemPedido.update({
      where: {
        id: req.params.itemId,
        pedido_id: req.params.id
      },
      data: req.body
    })

    // Encontrou e atualizou ~> HTTP 204: No Content
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

controller.deleteItem = async function(req, res) {
  try {
    await prisma.itemPedido.delete({
      where: {
        id: req.params.itemId,
        pedido_id: req.params.id
      }
    })

    // Encontrou e excluiu ~> HTTP 204: No Content
    res.status(204).end()
  }
  catch(error) {
    // P2025: erro do Prisma referente a objeto não encontrado
    if(error?.code === 'P2025') {
      // Não encontrou e não excluiu ~> retorna HTTP 404: Not Found
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

// Função para upload de foto para um pedido
controller.uploadFotoPedido = async function(req, res) {
  try {
    const { id } = req.params; // ID do pedido
    const file = req.file; // Arquivo da imagem

    if (!file) {
      return res.status(400).send('Nenhuma imagem enviada.');
    }

    // Verifica se o pedido existe
    const pedidoExistente = await prisma.pedido.findUnique({ where: { id } });
    if (!pedidoExistente) {
      return res.status(404).send('Pedido não encontrado.');
    }

    const foto = await prisma.fotoPedido.create({
      data: {
        pedido_id: id, // Vincula a foto ao pedido
        imagem: file.buffer, // Conteúdo binário da imagem
        mime_type: file.mimetype,
        nome: file.originalname,
      }
    });

    res.status(201).json(foto); // Retorna a foto criada com seu ID

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao fazer upload da imagem.');
  }
}

// Função para listar fotos de um pedido
controller.getFotosPedido = async function(req, res) {
  try {
    const { id } = req.params; // ID do pedido

    // Busca as fotos vinculadas a este pedido
    const fotos = await prisma.fotoPedido.findMany({ where: { pedido_id: id } });

    // Retorna as fotos (sem o binário da imagem, apenas metadados se quiser)
    // Para servir a imagem, precisaremos de outra rota
    res.status(200).json(fotos.map(foto => ({ 
      id: foto.id, 
      nome: foto.nome, 
      mime_type: foto.mime_type, 
      criado_em: foto.criado_em 
    }))); 

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar fotos do pedido.');
  }
}

// Função para servir uma foto específica de um pedido
controller.getFotoPedidoById = async function(req, res) {
  try {
    const { fotoId } = req.params; // ID da foto

    // Busca a foto pelo ID
    const foto = await prisma.fotoPedido.findUnique({ where: { id: fotoId } });

    if (!foto) {
      return res.status(404).send('Foto não encontrada.');
    }

    // Serve a imagem binária
    res.set('Content-Type', foto.mime_type);
    res.send(foto.imagem);

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar foto.');
  }
}

// Função para remover uma foto de um pedido
controller.deleteFotoPedido = async function(req, res) {
  try {
    const { fotoId } = req.params; // ID da foto

    // Deleta a foto pelo ID
    await prisma.fotoPedido.delete({ where: { id: fotoId } });

    res.status(204).end(); // No Content

  } catch (error) {
    if(error?.code === 'P2025') { // Foto não encontrada
      res.status(404).send('Foto não encontrada para exclusão.');
    } else {
      console.error(error);
      res.status(500).send('Erro ao excluir foto.');
    }
  }
}

export default controller