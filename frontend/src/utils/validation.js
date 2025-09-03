import * as Yup from "yup";

export const signUpSchema = Yup.object({
  name: Yup.string()
    .required("Name is required")
    .matches(/^[a-zA-Z_ ]*$/, "No special characters allowed.")
    .min(2, "Name must be between 2 and 25 characters.")
    .max(25, "Name must be between 2 and 25 characters."),
  email: Yup.string()
    .required("Email address is required.")
    .email("Invalid email address."),
  status: Yup.string().max(64, "Status must be less than 64 characters."),
  password: Yup.string()
    .required("Password is required.")
    .min(6, "Password must be at least 6 characters long."),
});

export const signInSchema = Yup.object({
  email: Yup.string()
    .required("Email address is required.")
    .email("Invalid email address."),
  password: Yup.string()
    .required("Password is required.")
    .min(6, "Password must be at least 6 characters long."),
});
