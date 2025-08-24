import { ConnectionsModal } from "@/components/profile/ConnectionsModal";

interface ConnectionsTabProps {
  userIds: { followers: string[]; following: string[] };
  className?: string;
}

export const ConnectionsTab = ({ userIds, className }: ConnectionsTabProps) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <ConnectionsModal
        userIds={userIds.followers}
        type="followers"
        onClose={() => {}}
      />
    </div>
  );
};