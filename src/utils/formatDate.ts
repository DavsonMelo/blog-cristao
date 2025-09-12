import { Timestamp } from 'firebase/firestore';

export function convertCreatedAt(createdAt: any): string {
  if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
    return (createdAt as Timestamp).toDate().toISOString();
  } else if (typeof createdAt === 'string') {
    return createdAt;
  } else {
    console.warn('createdAt inválido:', createdAt);
    return new Date().toISOString();
  }
}
