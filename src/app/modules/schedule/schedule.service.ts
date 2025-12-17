import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../../shared/prisma";

const createSchedule = async (payload: any) => {
  const { startTime, endTime, startDate, endDate } = payload;
  const intervalTime = 30;
  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);
  const schedules = [];
  while (currentDate <= lastDate) {
    const startTimeDate = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0])
        ),
        Number(endTime.split(":")[1])
      )
    );
    const endTimeDate = new Date(
      addMinutes(
        addHours(
          `${format(endDate, "yyyy-MM-dd")}`,
          Number(endDate.split(":")[0])
        ),
        Number(endDate.split(":")[1])
      )
    );
    while (startTimeDate <= endTimeDate) {
      const slotStartDateTime = startTimeDate;
      const slotEndDateTime = addMinutes(startTimeDate, intervalTime);
      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      const isExistsSchedule = await prisma.schedule.findFirst({
        where: scheduleData,
      });
      if (!isExistsSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        schedules.push(result);
      }
      slotStartDateTime.setMinutes(
        slotStartDateTime.getMinutes() + intervalTime
      );
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return schedules;
};

export const ScheduleService = {
  createSchedule,
};
