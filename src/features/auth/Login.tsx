import React from "react"
import { FormikHelpers, useFormik } from "formik"
import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom"
import { Button, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Grid, TextField } from "@mui/material"
import { useAppDispatch } from "common/hooks"
import { selectIsLoggedIn } from "features/auth/auth.selectors"
import { authThunks } from "features/auth/auth.reducer"
import { BaseResponseType } from "common/types"

type FormValues = {
  email: string
  password: string
  rememberMe: boolean
}

type FormikErrorType = {
  email?: string
  password?: string
  rememberMe?: boolean
}

export const Login = () => {
  const dispatch = useAppDispatch()

  const isLoggedIn = useSelector(selectIsLoggedIn)

  const formik = useFormik({
    validate: (values) => {
      const errors: FormikErrorType = {}
      if (!values.email) {
        errors.email = "Required"
      } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
        errors.email = "Invalid email address"
      }
      if (!values.password) {
        errors.password = "Required"
      } else if (values.password.length < 5) {
        errors.password = "Must be 5 characters at less"
      }
      return errors
    },
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    onSubmit: (values, formikHelpers: FormikHelpers<FormValues>) => {
      dispatch(authThunks.login(values))
        .unwrap() //он следит за тем, какой ответ приходит: если fullfiled - попадем в then, если rejected - попадем в catch. Это нужно, потому что с использованием createAsyncThunk мы всегда получаем promise.fullfiled
        .then((res) => {})
        .catch((err: BaseResponseType) => {
          err.fieldsErrors?.forEach((fieldError) => {
            formikHelpers.setFieldError(fieldError.field, fieldError.error)
          })
        }) //message:Rejected будет возвращаться, если в rejectWithValue мы передаем null
    },
  })

  if (isLoggedIn) {
    return <Navigate to={"/"} />
  }

  return (
    <Grid container justifyContent="center">
      <Grid item xs={4}>
        <form onSubmit={formik.handleSubmit}>
          <FormControl>
            <FormLabel>
              <p>
                To log in get registered{" "}
                <a href={"https://social-network.samuraijs.com/"} target={"_blank"}>
                  here
                </a>
              </p>
              <p>or use common test account credentials:</p>
              <p> Email: free@samuraijs.com</p>
              <p>Password: free</p>
            </FormLabel>
            <FormGroup>
              <TextField label="Email" margin="normal" {...formik.getFieldProps("email")} />
              {formik.errors.email ? <div style={{ color: "red" }}>{formik.errors.email}</div> : null}
              <TextField type="password" label="Password" margin="normal" {...formik.getFieldProps("password")} />
              {formik.errors.password ? <div style={{ color: "red" }}>{formik.errors.password}</div> : null}
              <FormControlLabel
                label={"Remember me"}
                control={<Checkbox {...formik.getFieldProps("rememberMe")} checked={formik.values.rememberMe} />}
              />
              <Button type={"submit"} variant={"contained"} color={"primary"}>
                Login
              </Button>
            </FormGroup>
          </FormControl>
        </form>
      </Grid>
    </Grid>
  )
}
