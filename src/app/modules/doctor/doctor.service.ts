import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../../helpers/paginationHelper";
import { prisma } from "../../../shared/prisma";
import { IDoctorUpdateInput } from "./doctor.interface";
import { doctorFilterableFields } from "./doctor.constant";

const getAllFromDB = async (filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, specialties, ...filterData } = filters;
  console.log(filters);

  const andConditions: Prisma.DoctorWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: doctorFilterableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }
  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }
  if (Object.keys(filterData).length > 0) {
    const filterCondition = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterCondition);
  }
  const whereCondition: Prisma.DoctorWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};
  const result = await prisma.doctor.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
  const total = await prisma.doctor.count({ where: whereCondition });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const updateDoctor = async (
  id: string,
  payload: Partial<IDoctorUpdateInput>
) => {
  const isDoctorExits = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });
  const { specialties, ...doctorData } = payload;
  return await prisma.$transaction(async (tnx) => {
    if (specialties && specialties.length > 0) {
      const deleteSpecialtyIds = specialties.filter(
        (specialty) => specialty.isDeleted
      );
      for (const specialty of deleteSpecialtyIds) {
        await tnx.doctorSpecialties.deleteMany({
          where: {
            doctorId: id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
      const createSpecialtyIds = specialties.filter(
        (specialty) => !specialty.isDeleted
      );
      for (const specialty of createSpecialtyIds) {
        await tnx.doctorSpecialties.createMany({
          data: {
            doctorId: isDoctorExits.id,
            specialitiesId: specialty.specialtyId,
          },
        });
      }
    }
    const doctor = await tnx.doctor.update({
      where: {
        id: isDoctorExits.id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
      // doctor - doctorSpecialties - specialties
    });

    return doctor;
  });
};

const deleteDoctor = async (id: string) => {
  await prisma.doctor.delete({
    where: {
      id,
    },
  });
};

const getSingleDoctor = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });
  return doctor;
};

export const DoctorService = {
  getAllFromDB,
  updateDoctor,
  deleteDoctor,
  getSingleDoctor,
};
