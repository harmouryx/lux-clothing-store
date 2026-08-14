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

export default function ResetPasswordForm() {


    return (
        <>

            <Card>
                <CardHeader>
                    <CardTitle> Reset Password </CardTitle>
                    <CardDescription> Enter your details to reset your credentials </CardDescription>
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