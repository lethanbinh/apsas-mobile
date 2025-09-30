export interface NotificationItemProps {
  id?: string | undefined;
  title: string;
  description: string;
  date: string;
  numNotification?: number;
  backgroundColor: string;
  iconColor: string;
}

export const notificationData: NotificationItemProps[] = [
  {
    id: '1',
    title: 'Assignment graded',
    description: 'Your assignment has been graded by NguyenNT',
    date: '9mins ago',
    numNotification: 2,
    backgroundColor: '#EEF3F1',
    iconColor: '#006B40',
  },
  {
    id: '2',
    title: 'Assignment graded',
    description: 'Your assignment has been graded by NguyenNT',
    date: '14mins ago',
    numNotification: 2,
    backgroundColor: '#FFF4DE',
    iconColor: '#FFA800',
  },
  {
    id: '3',
    title: 'Assignment graded',
    description: 'Your assignment has been graded by NguyenNT',
    date: '14mins ago',
    numNotification: 2,
    backgroundColor: '#FFEFF1',
    iconColor: '#E1260D',
  },
];
