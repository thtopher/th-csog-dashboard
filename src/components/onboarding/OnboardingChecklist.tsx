'use client';

import { useAuth } from '@/contexts/AuthContext';
import { UPLOAD_TYPES, type UploadType } from '@/config/uploadTypes';
import { DEFAULT_EXECUTIVES, getExecutiveById } from '@/config/executives';
import { Avatar } from '@/components/common/Avatar';
import { ArrowRight, ArrowLeft, FileSpreadsheet, Clock, Users } from 'lucide-react';

interface OnboardingChecklistProps {
  onNext: () => void;
  onBack: () => void;
}

export function OnboardingChecklist({ onNext, onBack }: OnboardingChecklistProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const userExecutiveId = user?.executiveId;

  // Get uploads for the current user
  const myUploads = UPLOAD_TYPES.filter(type =>
    userExecutiveId && type.allowedExecutives.includes(userExecutiveId)
  );

  // For admins, also show team uploads grouped by executive
  const teamUploadsByExecutive = isAdmin
    ? DEFAULT_EXECUTIVES
        .filter(exec => exec.id !== userExecutiveId) // Exclude current user
        .map(exec => ({
          executive: exec,
          uploads: UPLOAD_TYPES.filter(type =>
            type.allowedExecutives.includes(exec.id!)
          ),
        }))
        .filter(group => group.uploads.length > 0)
    : [];

  const totalUploads = isAdmin ? UPLOAD_TYPES.length : myUploads.length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          {isAdmin ? 'Upload Overview' : 'Your Upload Checklist'}
        </h1>
        <p className="text-gray-600">
          {isAdmin
            ? 'Here\'s how data uploads are distributed across your executive team.'
            : 'These are the data files you\'ll need to provide regularly. Each upload feeds into your dashboard metrics.'}
        </p>
      </div>

      {/* My Uploads Section */}
      {myUploads.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <FileSpreadsheet size={14} />
            Your Uploads ({myUploads.length})
          </h2>
          <div className="space-y-2">
            {myUploads.map(type => (
              <UploadTypeCard key={type.id} type={type} />
            ))}
          </div>
        </div>
      )}

      {/* Team Uploads Section (Admin only) */}
      {isAdmin && teamUploadsByExecutive.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Users size={14} />
            Team Uploads
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            You can upload any of these on behalf of your team. The responsible executive is shown for each.
          </p>
          <div className="space-y-6">
            {teamUploadsByExecutive.map(({ executive, uploads }) => (
              <div key={executive.id}>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar
                    executiveId={executive.id}
                    name={executive.name}
                    size="sm"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{executive.name}</p>
                    <p className="text-xs text-gray-500">{executive.title} &middot; {uploads.length} upload{uploads.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {uploads.map(type => (
                    <UploadTypeCard key={type.id} type={type} responsible={executive.title} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-blue-50 rounded-lg p-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
            <FileSpreadsheet size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-blue-900">
              {isAdmin
                ? `${totalUploads} upload types across ${teamUploadsByExecutive.length + (myUploads.length > 0 ? 1 : 0)} executives`
                : `${myUploads.length} upload type${myUploads.length !== 1 ? 's' : ''} total`}
            </p>
            <p className="text-sm text-blue-700">
              Templates available for download on the upload page
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <button
          onClick={onNext}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Continue
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}

function UploadTypeCard({ type, responsible }: { type: UploadType; responsible?: string }) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg border">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 shrink-0">
        <type.icon size={20} className="text-gray-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900">{type.name}</p>
        <p className="text-sm text-gray-500">{type.description}</p>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs text-gray-400">
          Feeds: {type.sourceProcesses.join(', ')}
        </div>
        {responsible && (
          <div className="text-xs text-gray-500 mt-1">
            Responsible: <span className="font-medium">{responsible}</span>
          </div>
        )}
      </div>
    </div>
  );
}
