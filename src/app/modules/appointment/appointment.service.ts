import config from "../../../config";
import { stripe } from "../../../helpers/stripe";
import { prisma } from "../../../shared/prisma";
import { IJWTPayload } from "../../types/common";
import { v4 as uuidv4 } from "uuid";

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
    await tnx.payment.create({
      data: {
        appointmentId: (await appointmentData).id,
        amount: doctorData.appointmentFee,
        transactionId,
      },
    });
    return appointmentData;
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
    mode: "payment",
    success_url: `${config.client_url}?success=true`,
    cancel_url: `${config.client_url}?cancel=false`,
  });
  console.log(session);

  return result;
};

export const AppointmentService = {
  createAppointment,
};
