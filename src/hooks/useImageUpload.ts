import { useState } from 'react';

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.secure_url) setImageUrl(data.secure_url);
    } catch (err) {
      console.error(err);
      alert('Erro no upload');
    } finally {
      setUploading(false);
    }
  };

  return { uploading, imageUrl, handleImageUpload };
}

/*
Esse código define um custom hook do React chamado useImageUpload. A principal função desse hook é abstrair a lógica de upload de imagens, tornando-a reutilizável em diferentes componentes da sua aplicação. 🚀

Análise Detalhada
1. Abstração de Lógica com Hooks
export function useImageUpload(): A convenção de nomear funções com o prefixo use indica que se trata de um hook. Ele permite que você use as funcionalidades internas do React, como o useState, fora de um componente funcional, mas de uma forma que um componente pode se conectar a ele.

const [uploading, setUploading] = useState(false);: Gerencia o estado de carregamento do upload. O uploading será true enquanto a imagem estiver sendo enviada, e false em outros momentos.

const [imageUrl, setImageUrl] = useState('');: Armazena a URL da imagem que foi carregada com sucesso. Inicialmente, é uma string vazia.

2. Função handleImageUpload
const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { ... }: Esta função assíncrona é a responsável por todo o processo de upload. Ela deve ser conectada ao evento onChange de um input de arquivo (<input type="file" />).

if (!e.target.files?.[0]) return;: Uma verificação de segurança para garantir que um arquivo foi realmente selecionado pelo usuário. Se nenhum arquivo for encontrado, a função é encerrada.

setUploading(true);: Define o estado de uploading para true no início do processo. Isso pode ser usado para exibir um indicador de carregamento na interface do usuário.

const formData = new FormData(); formData.append('file', e.target.files[0]);: Cria um objeto FormData, que é a maneira padrão de construir pares chave/valor de dados para enviar por formulário, incluindo arquivos. O arquivo selecionado é anexado com a chave 'file'.

try { ... }: O bloco try tenta executar o upload.

const res = await fetch('/api/upload', { ... });: Faz uma requisição POST para a rota de API /api/upload (a mesma rota que você mostrou no código anterior). O corpo da requisição é o formData que contém a imagem.

const data = await res.json();: Converte a resposta da API em um objeto JSON.

if (data.secure_url) setImageUrl(data.secure_url);: Se a resposta da API contiver a URL segura da imagem, ela é salva no estado imageUrl.

catch (err) { ... }: Caso ocorra qualquer erro durante o fetch ou o processamento da resposta, o erro é registrado no console e um alert é exibido ao usuário.

finally { setUploading(false); }: Este bloco de código é executado independentemente de o upload ter sido bem-sucedido ou ter falhado. Ele garante que o estado uploading sempre volte para false, finalizando o indicador de carregamento.
*/