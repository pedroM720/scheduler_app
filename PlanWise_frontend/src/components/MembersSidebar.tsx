import { Check, Clock } from 'lucide-react';

interface Member {
  id: number;
  name: string;
  avatar: string;
  hasSubmitted: boolean;
}

interface MembersSidebarProps {
  members: Member[];
}

export function MembersSidebar({ members }: MembersSidebarProps) {
  const submittedCount = members.filter(m => m.hasSubmitted).length;
  const totalCount = members.length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Group Members</h2>
        <p className="text-sm text-gray-500 mt-1">
          {submittedCount} of {totalCount} responded
        </p>
      </div>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-[#549EFF] to-[#8570FF] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {member.avatar}
              </div>
              
              {/* Status Indicator */}
              {member.hasSubmitted ? (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
              ) : (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-300 rounded-full border-2 border-white flex items-center justify-center">
                  <Clock className="w-3 h-3 text-gray-600" />
                </div>
              )}
            </div>

            {/* Name and Status */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">{member.name}</div>
              <div className="text-xs text-gray-500">
                {member.hasSubmitted ? 'Submitted' : 'Pending'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Member Button */}
      <button className="w-full mt-4 py-2.5 border-2 border-dashed border-gray-300 text-gray-600 font-medium rounded-lg hover:border-[#8570FF] hover:text-[#8570FF] transition-colors">
        + Add Member
      </button>
    </div>
  );
}
