import httpStatus from "http-status";
import {
  AppointmentStatus,
  PaymentStatus,
  Prisma,
  UserRole,
} from "@prisma/client";
import config from "../../../config";
import { IOptions, paginationHelper } from "../../../helpers/paginationHelper";
import { stripe } from "../../../helpers/stripe";
import { prisma } from "../../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../errors/ApiError";

const createAppointment = async (
  payload: { doctorId: string; scheduleId: string },
  user: IJWTPayload
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: { email: user.email },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  await prisma.doctorSchedules.findFirstOrThrow({
    where: {
      doctorId: payload.doctorId,
      scheduleId: payload.scheduleId,
      isBooked: false,
    },
  });
  const videoCallingId = uuidv4();
  const transactionId = uuidv4();
  const result = await prisma.$transaction(async (tnx) => {
    const appointmentData = tnx.appointment.create({
      data: {
        patientId: patientData.id,
        scheduleId: payload.scheduleId,
        doctorId: doctorData.id,
        videoCallingId,
      },
    });
    await tnx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          scheduleId: payload.scheduleId,
          doctorId: doctorData.id,
        },
      },
      data: {
        isBooked: true,
      },
    });
    const paymentData = await tnx.payment.create({
      data: {
        appointmentId: (await appointmentData).id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Appointment with ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: (await appointmentData).id,
        paymentId: paymentData.id,
      },
      mode: "payment",
      success_url: `${config.client_url}?success=true`,
      cancel_url: `${config.client_url}?cancel=false`,
    });
    console.log(session.metadata);

    return { paymentUrl: session.url };
  });

  return result;
};

const getAppointment = async (
  user: IJWTPayload,
  filters: any,
  options: IOptions
) => {
  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelper.calculatePagination(options);
  const { ...filterData } = filters;
  const andConditions: Prisma.AppointmentWhereInput[] = [];
  if (user.role === UserRole.PATIENT) {
    andConditions.push({
      patient: {
        email: user.email,
      },
    });
  } else if (user.role === UserRole.DOCTOR) {
    andConditions.push({
      doctor: {
        email: user.email,
      },
    });
  }
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }
  const whereConditions: Prisma.AppointmentWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};
  const result = await prisma.appointment.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include:
      user.role === UserRole.DOCTOR ? { patient: true } : { doctor: true },
  });
  const total = await prisma.appointment.count({
    where: whereConditions,
  });
  return {
    meta: {
      total,
      limit,
      page,
    },
    data: result,
  };
};

const updateAppointmentStatus = async (
  appointmentId: string,
  status: AppointmentStatus,
  user: IJWTPayload
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
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
  return await prisma.appointment.update({
    where: {
      id: appointmentId,
    },
    data: {
      status,
    },
  });
};

const cancelUnpaidAppointments = async () => {
  const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
  const unPaidAppointments = await prisma.appointment.findMany({
    where: {
      createdAt: {
        lte: thirtyMinAgo,
      },
      paymentStatus: PaymentStatus.UNPAID,
    },
  });

  const appointmentIdsCancel = unPaidAppointments.map(
    (appointment) => appointment.id
  );
  await prisma.$transaction(async (tnx) => {
    await tnx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentIdsCancel,
        },
      },
    });
    await tnx.appointment.deleteMany({
      where: {
        id: {
          in: appointmentIdsCancel,
        },
      },
    });
    for (const unPaidAppointment of unPaidAppointments) {
      await tnx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            scheduleId: unPaidAppointment.scheduleId,
            doctorId: unPaidAppointment.doctorId,
          },
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const AppointmentService = {
  createAppointment,
  getAppointment,
  updateAppointmentStatus,
  cancelUnpaidAppointments,
};
