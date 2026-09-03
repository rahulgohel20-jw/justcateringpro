import { useState } from "react";
import ClientInsightLeftList from "../../../../components/clientinsight/Clientinsightleftlist";
import ClientInsightRightLog from "../../../../components/clientinsight/Clientinsightrightlog";

export default function ClientInsight() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="flex h-screen overflow-hidden font-sans">
      {/* LEFT panel — fixed width, scrolls independently */}
      <div className="w-80 flex-shrink-0 h-screen overflow-y-auto no-scrollbar">
        <ClientInsightLeftList
          selectedUser={selectedUser}
          onSelectUser={setSelectedUser}
        />
      </div>

      {/* RIGHT panel — fills rest, scrolls independently */}
      <div className="flex-1 h-screen overflow-y-auto no-scrollbar">
        <ClientInsightRightLog selectedUser={selectedUser} />
      </div>
    </div>
  );
}