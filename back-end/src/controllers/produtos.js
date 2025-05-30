import prisma from '../database/client.js'
import { includeRelations } from '../lib/utils.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const controller = {}   // Objeto vazio

controller.create = async function(req, res) {
  try {
    // Prepara os dados do produto
    const produtoData = { 
      ...req.body,
      quantidade: parseFloat(req.body.quantidade),
      preco_unitario: parseFloat(req.body.preco_unitario),
      qtd_estoque: parseFloat(req.body.qtd_estoque)
    }
    
    // Remove o campo de imagens do objeto principal, pois será tratado separadamente
    delete produtoData.imagens;

    // Cria o produto
    const novoProduto = await prisma.produto.create({ 
      data: produtoData
    })

    // Se houver arquivos enviados, cria registros na coleção ImagemProduto
    if (req.files && req.files.length > 0) {
      const imagensCriadas = req.files.map(async file => {
        return prisma.imagemProduto.create({
          data: {
            produto_id: novoProduto.id,
            imagem: file.buffer, // Salva o conteúdo binário da imagem
            mime_type: file.mimetype,
            nome: file.originalname // Ou file.filename, dependendo do que preferir
          }
        });
      });
      await Promise.all(imagensCriadas);
    }

    // Se houver fornecedores associados, atualiza cada um deles
    if(req.body.fornecedor_ids?.length > 0) {
      await Promise.all(
        req.body.fornecedor_ids.map(fornecedorId =>
          prisma.fornecedor.update({
            where: { id: fornecedorId },
            data: {
              produto_ids: {
                push: novoProduto.id
              }
            }
          })
        )
      )
    }

    // Retorna o produto criado com sucesso
    res.status(201).json(novoProduto) // Alterado para retornar o produto criado
  }
  catch(error) {
    console.error(error)
    res.status(500).send(error)
  }
}

controller.retrieveAll = async function(req, res) {
  try {

    const include = includeRelations(req.query)

    console.log({include})

    // Manda buscar os dados no servidor de BD
    const result = await prisma.produto.findMany({
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
    const result = await prisma.produto.findUnique({
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
    const { id } = req.params;
    const { fornecedor_ids, existingImagesToKeep, ...otherData } = req.body;

    // Converte campos numéricos
    const produtoData = {
      ...otherData,
      quantidade: parseFloat(otherData.quantidade),
      preco_unitario: parseFloat(otherData.preco_unitario),
      qtd_estoque: parseFloat(otherData.qtd_estoque)
    };

    // Buscar as imagens atualmente vinculadas a este produto
    const imagensAtuaisDoProduto = await prisma.imagemProduto.findMany({
      where: { produto_id: id },
      select: { id: true } // Seleciona apenas o ID das imagens
    });
    const idsImagensAtuais = imagensAtuaisDoProduto.map(img => img.id);

    // Identificar IDs de imagens a serem removidas
    const idsImagensParaRemover = idsImagensAtuais.filter(
      idImagem => !existingImagesToKeep.includes(idImagem)
    );

    // Deletar imagens removidas da coleção ImagemProduto
    if (idsImagensParaRemover.length > 0) {
      await prisma.imagemProduto.deleteMany({
        where: { id: { in: idsImagensParaRemover } }
      });
      console.log(`Imagens removidas do MongoDB: ${idsImagensParaRemover.join(', ')}`);
    }

    // Processar novas imagens enviadas (se houver)
    if (req.files && req.files.length > 0) {
      const novasImagensCriadas = req.files.map(async file => {
        return prisma.imagemProduto.create({
          data: {
            produto_id: id,
            imagem: file.buffer,
            mime_type: file.mimetype,
            nome: file.originalname
          }
        });
      });
      await Promise.all(novasImagensCriadas);
    }

    // Lógica para fornecedores_ids (mantida)
    if (fornecedor_ids) {
      // Primeiro, atualiza o produto com os outros dados (sem o campo de imagens diretas)
      await prisma.produto.update({
        where: { id: id },
        data: produtoData,
      });

      // Depois, atualiza todos os fornecedores relacionados
      await Promise.all(
        fornecedor_ids.map(fornecedorId =>
          prisma.fornecedor.update({
            where: { id: fornecedorId },
            data: {
              produto_ids: {
                push: id
              }
            }
          })
        )
      );
    } else {
      // Se não houver fornecedor_ids, apenas atualiza o produto normalmente
      await prisma.produto.update({
        where: { id: id },
        data: produtoData
      });
    }

    res.status(204).end();
  } catch (error) {
    if (error?.code === 'P2025') {
      res.status(404).end();
    } else {
      console.error(error);
      res.status(500).send(error);
    }
  }
};

controller.delete = async function(req, res) {
  try {
    // Busca o documento a ser excluído pelo id passado
    // como parâmetro e efetua a exclusão, caso encontrado
    await prisma.produto.delete({
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

controller.getImagensByProduto = async function(req, res) {
  try {
    const { id } = req.params; // ID do produto

    // Buscar todas as imagens associadas a este produto
    const imagens = await prisma.imagemProduto.findMany({
      where: { produto_id: id }
    });

    // Retornar a lista de imagens
    res.send(imagens);

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao buscar imagens do produto');
  }
}

controller.getImagem = async function(req, res) {
  try {
    const { id } = req.params; // ID da imagem na coleção ImagemProduto

    // Buscar a imagem pelo ID na coleção ImagemProduto
    const imagem = await prisma.imagemProduto.findUnique({
      where: { id }
    });

    if (!imagem) {
      return res.status(404).send('Imagem não encontrada');
    }

    // Definir o tipo de conteúdo da resposta com base no mime_type
    res.setHeader('Content-Type', imagem.mime_type);

    // Enviar os dados binários da imagem
    res.send(imagem.imagem);

  } catch (error) {
    console.error(error);
    res.status(500).send('Erro ao servir imagem');
  }
}

export default controller