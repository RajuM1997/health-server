import { prisma } from "../../../shared/prisma";
import { IJWTPayload } from "../../types/common";

const insertIntoDB = async (
  payload: { scheduleIds: string[] },
  user: IJWTPayload
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => ({
    doctorId: doctorData.id,
    scheduleId,
  }));
  return await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
};

export const doctorScheduleService = {
  insertIntoDB,
};
