import { Gender } from "@prisma/client";

export type IDoctorUpdateInput = {
  contactNumber: string;
  gender: Gender;
  appointmentFee: number;
  name: string;
  address: string;
  registrationNumber: string;
  experience: number;
  qualification: string;
  currentWorkingPlace: string;
  designation: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  specialties: {
    specialtyId: string;
    isDeleted?: boolean;
  }[];
};
