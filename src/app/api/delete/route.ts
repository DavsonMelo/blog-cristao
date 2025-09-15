import { NextResponse } from 'next/server';
import { adminApp } from '@/lib/firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/lib/firebase-admin-auth';

const db = getFirestore(adminApp);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { postId, imagePublicId } = await req.json();

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // pega post no Firestore
    const postRef = db.collection('posts').doc(postId);
    const postSnap = await postRef.get();
    if (!postSnap.exists) {
      return NextResponse.json(
        { error: 'Post não encontrado' },
        { status: 404 }
      );
    }

    const postData = postSnap.data();

    // checa se o post pertence ao usuário
    if (postData?.authorUID !== user.uid) {
      return NextResponse.json(
        { error: 'Sem permissão para deletar' },
        { status: 403 }
      );
    }

    // deleta imagem no Cloudinary (se tiver)
    if (imagePublicId) {
      await cloudinary.uploader.destroy(imagePublicId);
    }

    // deleta post no Firestore
    await postRef.delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
