import { Prisma } from 'generated/prisma/client';

export const reviewsSelect: Prisma.ReviewSelect = {
  id: true,
  text: true,
  rating: true,
  createdAt: true,
  updatedAt: true,
  sender: {
    select: {
      id: true,
      name: true,
      lastName: true,
      avatarFile: {
        select: {
          path: true,
        },
      },
    },
  },
};
