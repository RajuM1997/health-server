import z from "zod";

const createPatientValidationSchema = z.object({
  password: z.string(),
  patient: z.object({
    name: z.string().nonempty("Name is required"),
    email: z.string().nonempty("Email is required"),
    address: z.string().optional(),
  }),
});

const createAdminValidationSchema = z.object({
  password: z.string(),
  admin: z.object({
    name: z.string().nonempty("Name is required"),
    email: z.string().nonempty("Email is required"),
    contactNumber: z.string().optional(),
    profilePhoto: z.string().optional(),
  }),
});

const createDoctorValidationSchema = z.object({
  password: z.string(),
  doctor: z.object({
    name: z.string().nonempty("Name is required"),
    email: z.string().nonempty("Email is required"),
    address: z.string().nonempty("Address is required"),
    registrationNumber: z.string().nonempty("Registration Number is required"),
    qualification: z.string().nonempty("Qualification number is required"),
    designation: z.string().nonempty("Designation number is required"),
    contactNumber: z.string().nonempty("Contact number is required"),
    gender: z.string().nonempty("gender is required"),
    currentWorkingPlace: z
      .string()
      .nonempty("Current WorkingPlace Number is required"),
    appointmentFee: z.number(),
    profilePhoto: z.string().optional(),
  }),
});
export const UserValidation = {
  createPatientValidationSchema,
  createAdminValidationSchema,
  createDoctorValidationSchema,
};
