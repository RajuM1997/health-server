import { Patient, Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../../helpers/paginationHelper";
import { prisma } from "../../../shared/prisma";
import { patientFilterAbleFields } from "./patient.constant";
import { IJWTPayload } from "../../types/common";

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
  await prisma.patient.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
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

const updateIntoDB = async (user: IJWTPayload, payload: any) => {
  const { medicalReport, patientHealthData, ...patientData } = payload;

  const patientInfo = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
      isDeleted: false,
    },
  });

  return await prisma.$transaction(async (tnx) => {
    await tnx.patient.update({
      where: {
        id: patientInfo.id,
      },
      data: patientData,
    });
    if (patientHealthData) {
      await tnx.patientHealthData.upsert({
        where: {
          patientId: patientInfo.id,
        },
        update: patientHealthData,
        create: {
          ...patientHealthData,
          patientId: patientInfo.id,
        },
      });
    }
    if (medicalReport) {
      await tnx.medicalReport.create({
        data: {
          ...medicalReport,
          patientId: patientInfo.id,
        },
      });
    }

    const result = await tnx.patient.findUniqueOrThrow({
      where: {
        id: patientInfo.id,
      },
      include: {
        patientHealthData: true,
        medicalReports: true,
      },
    });

    return result;
  });
};

export const PatientService = {
  getAllFromDB,
  updatePatient,
  deletePatient,
  getSinglePatient,
  updateIntoDB,
};
