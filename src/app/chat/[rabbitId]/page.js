'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import ChatBot from '@/components/ChatBot/ChatBot';
import { getImagePath } from '@/utils/constants';
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
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.imageSection}>
          <Image
            src={getImagePath(rabbitId)}
            alt={`Rabbit #${rabbitId}`}
            width={500}
            height={500}
            className={styles.rabbitImage}
            priority
          />
        </div>
        <div className={styles.chatSection}>
          <ChatBot rabbitId={rabbitId} fullPage={true} />
        </div>
      </div>
    </div>
  );
}
