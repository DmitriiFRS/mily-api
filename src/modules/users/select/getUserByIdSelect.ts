import { Prisma } from 'generated/prisma/client';

export const getUserByIdSelect: Prisma.UserSelect = {
  id: true,
  email: true,
  phoneNumber: true,
  name: true,
  lastName: true,
  about: true,
  reviewsCount: true,
  ratingSum: true,
  rating: true,
  role: {
    select: {
      id: true,
      name: true,
    },
  },
  avatarFile: {
    select: {
      id: true,
      fileName: true,
      path: true,
      mimeType: true,
      size: true,
    },
  },
  reviewsAsSender: {
    select: {
      id: true,
      rating: true,
      text: true,
      createdAt: true,
    },
  },
};
