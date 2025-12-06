import { prisma } from '@/lib/db';
import { Card, CardBody, Badge } from '@/components/ui';
import { formatDateTime } from '@/lib/utils';
import { CreateAnnouncementButton } from './CreateAnnouncementButton';
import { AnnouncementActions } from './AnnouncementActions';

export const dynamic = 'force-dynamic';

async function getAnnouncements() {
  return prisma.announcement.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      createdByAdmin: { select: { email: true } },
    },
  });
}

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Announcements</h1>
          <p className="text-stone-500 mt-1">Post and manage company announcements</p>
        </div>
        <CreateAnnouncementButton />
      </div>

      <div className="space-y-4">
        {announcements.length === 0 ? (
          <Card>
            <CardBody className="py-12 text-center text-stone-500">
              No announcements yet. Create one to get started.
            </CardBody>
          </Card>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id}>
              <CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-stone-900">
                        {announcement.title}
                      </h3>
                      <Badge variant={announcement.isActive ? 'success' : 'default'}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-stone-600 whitespace-pre-wrap">{announcement.body}</p>
                    <p className="text-sm text-stone-400 mt-3">
                      Posted by {announcement.createdByAdmin.email} • {formatDateTime(announcement.createdAt)}
                    </p>
                  </div>
                  <AnnouncementActions announcement={announcement} />
                </div>
              </CardBody>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

