import httpStatus from "http-status";
import { Prisma } from "@prisma/client";
import { IOptions, paginationHelper } from "../../../helpers/paginationHelper";
import { prisma } from "../../../shared/prisma";
import { IDoctorUpdateInput } from "./doctor.interface";
import { doctorFilterableFields } from "./doctor.constant";
import ApiError from "../../errors/ApiError";
import { openai } from "../../../helpers/open-router";
import { extractJsonFromMessage } from "../../../helpers/extractJsonFromMessage";

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
      reviews: {
        select: {
          rating: true,
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

const getAISuggestions = async (payload: { symptoms: string }) => {
  if (!(payload && payload.symptoms)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Symptom is required");
  }
  const doctors = await prisma.doctor.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });
  const prompt = `
  You are a medical assistant AI. Based on then patient's symptoms, suggest the top most suitable doctors. Each doctor has specialties and year of experience. Only suggest doctor who are relevant to the given symptoms.
  
  Symptoms: ${payload.symptoms}

  Here is the doctor list (in JSON):
  ${JSON.stringify(doctors, null, 2)}
  Return your response in JSON format with full individual doctor data.
  `;
  const completion = await openai.chat.completions.create({
    model: "z-ai/glm-4.5-air:freg",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful AI medical assistant that provides doctor suggestion.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });
  const result = extractJsonFromMessage(completion.choices[0].message);
  return result;
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
      isDeleted: false,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
      reviews: true,
    },
  });
  return doctor;
};

export const DoctorService = {
  getAllFromDB,
  updateDoctor,
  deleteDoctor,
  getSingleDoctor,
  getAISuggestions,
};
