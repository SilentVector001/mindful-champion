
'use client';

import PTTAICoach from './ptt-ai-coach';

interface CoachKaiWrapperProps {
  userId: string;
  userName: string;
  userEmail: string;
}

export default function CoachKaiWrapper({ userId, userName, userEmail }: CoachKaiWrapperProps) {
  return (
    <div className="space-y-4">
      {/* Coach Kai Chat Interface */}
      <PTTAICoach 
        userContext={{
          name: userName,
          firstName: userName.split(' ')[0],
        }}
      />
    </div>
  );
}
