import { Patient, Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../../helpers/paginationHelper";
import { prisma } from "../../../shared/prisma";
import { patientFilterAbleFields } from "./patient.constant";

const getAllFromDB = async (options: IOptions, filters: any) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;
  const andConditions: Prisma.PatientWhereInput[] = [];
  if (searchTerm) {
    andConditions.push({
      OR: patientFilterAbleFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
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
  const whereCondition: Prisma.PatientWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};
  const result = await prisma.patient.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
  });
  const total = await prisma.patient.count({ where: whereCondition });
  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const updatePatient = async (id: string, payload: Partial<Patient>) => {
  const isPatientExits = await prisma.patient.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const patient = await prisma.patient.update({
    where: {
      id: isPatientExits.id,
    },
    data: payload,
  });

  return patient;
};

const deletePatient = async (id: string) => {
  await prisma.patient.delete({
    where: {
      id,
    },
  });
};

const getSinglePatient = async (id: string) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id,
    },
  });
  return patient;
};

export const PatientService = {
  getAllFromDB,
  updatePatient,
  deletePatient,
  getSinglePatient,
};
