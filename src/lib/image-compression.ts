export async function compressImage(
  file: File, 
  options: {
    maxWidth: number;
    maxHeight?: number;
    quality: number; // 0.1 a 1.0
    format?: 'jpeg' | 'png' | 'webp';
  } = {
    maxWidth: 1200,
    quality: 0.7,
    format: 'jpeg'
  }
): Promise<File> {
  // Se não for imagem, retorna o arquivo original
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calcular novas dimensões mantendo proporção
        if (width > options.maxWidth) {
          const ratio = options.maxWidth / width;
          width = options.maxWidth;
          height = height * ratio;
        }

        // Se maxHeight foi definido, verificar também
        if (options.maxHeight && height > options.maxHeight) {
          const ratio = options.maxHeight / height;
          height = options.maxHeight;
          width = width * ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Configurações de qualidade de renderização
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Desenhar imagem redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Determinar o tipo MIME baseado no formato escolhido
        let mimeType = 'image/jpeg';
        if (options.format === 'png') mimeType = 'image/png';
        if (options.format === 'webp') mimeType = 'image/webp';

        // Converter para blob com qualidade
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Image compression failed'));
              return;
            }

            // Criar novo arquivo com nome e metadata similares
            const compressedFile = new File([blob], file.name, {
              type: mimeType,
              lastModified: Date.now(),
            });

            // Log de economia (opcional)
            console.log(
              `Compressão: ${(file.size / 1024).toFixed(0)}KB → ${(blob.size / 1024).toFixed(0)}KB ` +
              `(${((1 - blob.size / file.size) * 100).toFixed(1)}% de economia)`
            );

            resolve(compressedFile);
          },
          mimeType,
          options.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    // Timeout de segurança
    setTimeout(() => {
      reject(new Error('Image compression timeout'));
    }, 30000);
  });
}

// Versão alternativa para Node.js (se precisar no futuro)
export async function compressImageNode(
  fileBuffer: Buffer,
  options: {
    maxWidth: number;
    quality: number;
  }
): Promise<Buffer> {
  // Implementação para server-side (usando sharp ou similar)
  throw new Error('Server-side compression not implemented yet');
}