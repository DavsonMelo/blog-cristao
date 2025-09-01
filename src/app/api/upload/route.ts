import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

// Configura credenciais do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
    }

    // Converte o arquivo em buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Faz upload pro Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ folder: 'blog_posts' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/*
Explicação do Código de Upload para o Cloudinary
Este código é uma rota de API para o Next.js, projetada para fazer o upload de arquivos, especificamente imagens, para o serviço de hospedagem de mídia Cloudinary. Ele atua como um intermediário seguro entre o frontend do seu aplicativo (onde o usuário seleciona uma imagem) e o Cloudinary.

Análise Detalhada
import statements:

import { v2 as cloudinary } from 'cloudinary'; e import { NextResponse } from 'next/server';: Importa a biblioteca cloudinary para interagir com o serviço de upload e NextResponse para criar respostas de API no Next.js.

Configuração do Cloudinary:

cloudinary.config(...): Este bloco configura as credenciais do Cloudinary, obtendo o nome da nuvem, a chave e o segredo da API a partir de variáveis de ambiente (process.env). Isso garante que informações sensíveis não fiquem expostas no código.

Função POST:

export async function POST(req: Request): No Next.js 13+, as rotas de API (Route Handlers) são criadas exportando funções que correspondem aos métodos HTTP. A função POST lida com as requisições do tipo POST.

Processamento do Arquivo:

const formData = await req.formData();: Pega o corpo da requisição e o trata como formData, que é o formato padrão para envios de arquivos.

const file = formData.get('file') as File;: Extrai o arquivo da formData usando a chave 'file'.

if (!file) ...: Uma verificação de segurança para garantir que um arquivo foi realmente enviado. Se não houver, ele retorna um erro com status 400.

Conversão do Arquivo:

const arrayBuffer = await file.arrayBuffer();: Converte o arquivo em um ArrayBuffer, um tipo de dado binário.

const buffer = Buffer.from(arrayBuffer);: Converte o ArrayBuffer em um Buffer do Node.js, que é o formato exigido pela função de upload do Cloudinary.

Upload para o Cloudinary:

const result = await new Promise(...): Envolve a chamada da API do Cloudinary em uma Promise. Isso é necessário porque o método upload_stream do Cloudinary usa um callback, e a Promise permite que o código seja async/await.

cloudinary.uploader.upload_stream(...): Esta é a função principal de upload.

{ folder: 'blog_posts' }: Especifica a pasta de destino dentro da sua conta do Cloudinary, ajudando a manter seus arquivos organizados.

(error, result) => { ... }: O callback que é executado quando o upload termina (com sucesso ou erro). Se houver um erro, a Promise é rejeitada; caso contrário, ela é resolvida com o resultado do upload.

.end(buffer);: Inicia o upload do arquivo (buffer) para o Cloudinary.

Resposta da API:

return NextResponse.json(result);: Se o upload for bem-sucedido, a função retorna uma resposta JSON com o objeto result do Cloudinary, que inclui a URL da imagem. O frontend então usa essa URL para exibir a imagem e salvá-la no banco de dados.

Tratamento de Erros:

catch (error: any) { ... }: Captura qualquer erro que ocorra durante o processo, loga-o no console do servidor e retorna uma resposta de erro (status: 500) para o cliente.
*/
