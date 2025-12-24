import httpStatus from "http-status";
import {
  AppointmentStatus,
  PaymentStatus,
  Prescription,
  UserRole,
} from "@prisma/client";
import { IJWTPayload } from "../../types/common";
import { prisma } from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";
import { IOptions, paginationHelper } from "../../../helpers/paginationHelper";

const createPrescription = async (
  user: IJWTPayload,
  payload: Partial<Prescription>
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId,
      status: AppointmentStatus.COMPLETED,
      paymentStatus: PaymentStatus.PAID,
    },
    include: {
      doctor: true,
    },
  });
  if (user.role === UserRole.DOCTOR) {
    if (!(user.email === appointmentData.doctor.email)) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "This is not your appointment"
      );
    }
  }

  const result = await prisma.prescription.create({
    data: {
      appointmentId: appointmentData.id,
      doctorId: appointmentData.doctorId,
      patientId: appointmentData.patientId,
      instructions: payload.instructions as string,
      followUpDate: payload.followUpDate || null,
    },
    include: {
      patient: true,
    },
  });
  return result;
};

const getMyPrescription = async (user: IJWTPayload) => {
  const patient = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const prescription = await prisma.prescription.findMany({
    where: {
      patientId: patient.id,
    },
  });
  return prescription;
};

const patientPrescription = async (user: IJWTPayload, options: IOptions) => {
  const { limit, page, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const result = await prisma.prescription.findMany({
    where: {
      patient: {
        email: user.email,
      },
    },
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    },
  });
  const total = await prisma.prescription.count({
    where: {
      patient: {
        email: user.email,
      },
    },
  });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const PrescriptionService = {
  createPrescription,
  getMyPrescription,
  patientPrescription,
};
