'use client';

import { useParams, useRouter } from 'next/navigation';
import ChatBot from '@/components/ChatBot/ChatBot';
import styles from './page.module.css';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const rabbitId = params.rabbitId;

  const handleBack = () => {
    router.back();
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button onClick={handleBack} className={styles.backButton}>
          ← Back
        </button>
        <h1 className={styles.title}>Chat with Rabbit #{rabbitId}</h1>
      </div>
      <div className={styles.chatWrapper}>
        <ChatBot rabbitId={rabbitId} fullPage={true} />
      </div>
    </div>
  );
}
