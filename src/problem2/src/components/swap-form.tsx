"use client"

import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TOKENS } from "@/lib/constants"

const formSchema = z.object({
  fromToken: z.string().min(1, "Please select a token"),
  fromAmount: z
    .string()
    .min(1, "Please enter an amount")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Must be a positive number"
    ),
  toToken: z.string().min(1, "Please select a token"),
})

export function SwapForm() {
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromToken: "",
      fromAmount: "",
      toToken: "",
    },
  })

  const fromAmount = form.watch("fromAmount")
  const { isValid } = form.formState

  const toAmount = useMemo(() => fromAmount || "", [fromAmount])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    toast.info(`Processing swap: ${data.fromAmount} ${data.fromToken} → ${toAmount} ${data.toToken}`, {
      duration: 2000,
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success(`Swap confirmed: ${data.fromAmount} ${data.fromToken} → ${toAmount} ${data.toToken}`, {
      duration: 4000,
    })

    await new Promise(resolve => setTimeout(resolve, 4000))

    setIsLoading(false)
    form.reset()
  }

  return (
    <Card className="w-full sm:min-w-md min-w-xl">
      <CardHeader>
        <CardTitle>Token Swap</CardTitle>
        <CardDescription>Swap tokens at current market rates</CardDescription>
      </CardHeader>
      <CardContent>
        <form id="swap-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="fromToken"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="from-token">From Token</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="from-token" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map((token) => (
                        <SelectItem key={token} value={token} className="bg-gray-50 hover:bg-gray-100">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token}.svg`}
                              alt={token}
                              className="size-5"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                            <span>{token}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="fromAmount"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="from-amount">Amount</FieldLabel>
                  <Input
                    {...field}
                    id="from-amount"
                    type="number"
                    step="any"
                    aria-invalid={fieldState.invalid}
                    placeholder="0.00"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} className="text-red-600" />
                  )}
                </Field>
              )}
            />

            <Controller
              name="toToken"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="to-token">To Token</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="to-token" aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map((token) => (
                        <SelectItem key={token} value={token} className="bg-gray-50 hover:bg-gray-100">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${token}.svg`}
                              alt={token}
                              className="size-5"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                            <span>{token}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Field>
              <FieldLabel htmlFor="to-amount">You will receive</FieldLabel>
              <Input
                id="to-amount"
                type="number"
                value={toAmount}
                disabled
                placeholder="0.00"
              />
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()} disabled={isLoading}>
            Reset
          </Button>
          <Button type="submit" form="swap-form" disabled={!isValid || isLoading}>
            {isLoading ? "Processing..." : "Swap"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
