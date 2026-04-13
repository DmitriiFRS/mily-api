export const getMeSelect = {
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
  ads: {
    select: {
      id: true,
      type: true,
      status: true,
      dateFrom: true,
      dateTo: true,
      weightKg: true,
      description: true,
      price: true,
      servicePrice: true,
      //
      originCity: {
        select: {
          id: true,
          name: true,
        },
      },
      destinationCity: {
        select: {
          id: true,
          name: true,
        },
      },
      cargoCategory: {
        select: {
          id: true,
          name: true,
        },
      },
      images: {
        select: {
          id: true,
          order: true,
          file: {
            select: {
              id: true,
              fileName: true,
              path: true,
              mimeType: true,
              size: true,
            },
          },
        },
      },
      translations: true,
      createdAt: true,
      updatedAt: true,
    },
  },
};
