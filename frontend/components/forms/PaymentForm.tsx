"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function RegisterForm() {


    return (
        <>

            <Card>
                <CardHeader>
                    <CardTitle> Payment Details </CardTitle>
                </CardHeader>
                <CardContent>

                    <form action="" method="post">
                        <FieldSet>
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="card_number">Credit Card Number:</FieldLabel>
                                    <Input id="card_number" autoComplete="off" placeholder="1234 1234 1234 1234" />
                                    <FieldError> Invalid Email </FieldError >
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="expiration_date">Expiration Date:</FieldLabel>
                                    <Input id="expiration_date" autoComplete="off" placeholder="MM / AA" />
                                    <FieldError> Invalid Email </FieldError >
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="security_code">Security Code:</FieldLabel>
                                    <Input id="security_code" autoComplete="off" placeholder="CVC" />
                                    <FieldError> Invalid Email </FieldError >
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="card_country">Country:</FieldLabel>
                                    <Input id="card_country" autoComplete="off" placeholder="Select Country" />
                                    <FieldError> Invalid Email </FieldError >
                                </Field>
                                <Field orientation="horizontal">
                                    <Button> Pay Now </Button>
                                </Field>

                            </FieldGroup>
                        </FieldSet>
                    </form>
                </CardContent>
            </Card>
        </>
    );
}