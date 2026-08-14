"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"


export default function AccessForm() {


  return (
    <>

      <Card>
        <CardHeader>
          <CardTitle>Log In</CardTitle>
          <CardDescription> Enter your personal credentials to shop  everything you need </CardDescription>
        </CardHeader>
        <CardContent>

          <form action="" method="post">
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="email">Email:</FieldLabel>
                  <Input id="email" autoComplete="off" placeholder="your-email@domain.com" />
                  <FieldError> Invalid Email </FieldError >
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Password:</FieldLabel>
                  <Input id="username" autoComplete="off" aria-invalid />
                  <FieldError> Invalid Password </FieldError>
                </Field>
                <Field orientation="horizontal">
                  <Button> Continue </Button>
                </Field>
              </FieldGroup>
            </FieldSet>
          </form>
        </CardContent>
      </Card>
      <Link href='/signup' > Sign In </Link>
      <Link href='/reset-password'> Reset Password </Link>
    </>
  );
}