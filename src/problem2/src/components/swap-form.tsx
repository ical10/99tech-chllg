"use client"

import { useEffect, useState } from "react"
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CheckIcon, ChevronsUpDownIcon, LoaderIcon, CheckCircleIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { TOKENS } from "@/lib/constants"
import { convertTokenAmount, usePrices } from "@/lib/price-service"

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
  const [toAmount, setToAmount] = useState("")
  const [fromTokenOpen, setFromTokenOpen] = useState(false)
  const [toTokenOpen, setToTokenOpen] = useState(false)

  const { data: prices } = usePrices()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fromToken: "",
      fromAmount: "",
      toToken: "",
    },
  })

  const fromAmount = form.watch("fromAmount")
  const fromToken = form.watch("fromToken")
  const toToken = form.watch("toToken")
  const { isValid } = form.formState

  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      const converted = convertTokenAmount(prices, fromToken, toToken, fromAmount)
      setToAmount(converted)
    } else {
      setToAmount("")
    }
  }, [fromAmount, fromToken, toToken, prices])

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true)

    toast(`Processing swap: ${data.fromAmount} ${data.fromToken} → ${toAmount} ${data.toToken}`, {
      duration: 2000,
      icon: <LoaderIcon className="animate-spin" />,
    })

    await new Promise(resolve => setTimeout(resolve, 2000))

    toast.success(`Swap confirmed: ${data.fromAmount} ${data.fromToken} → ${toAmount} ${data.toToken}`, {
      duration: 4000,
      icon: <CheckCircleIcon className="text-green-500" />,
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
                  <Popover open={fromTokenOpen} onOpenChange={setFromTokenOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        aria-expanded={fromTokenOpen}
                      >
                        {field.value ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${field.value}.svg`}
                              alt={field.value}
                              className="size-5"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                            <span>{field.value}</span>
                          </div>
                        ) : (
                          "Select token"
                        )}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search token..." />
                        <CommandList>
                          <CommandEmpty>No token found.</CommandEmpty>
                          <CommandGroup>
                            {TOKENS.map((token) => (
                              <CommandItem
                                key={token}
                                value={token}
                                onSelect={() => {
                                  field.onChange(token)
                                  setFromTokenOpen(false)
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === token ? "opacity-100" : "opacity-0"
                                  )}
                                />
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
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
                  <Popover open={toTokenOpen} onOpenChange={setToTokenOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                        aria-expanded={toTokenOpen}
                      >
                        {field.value ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${field.value}.svg`}
                              alt={field.value}
                              className="size-5"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                            <span>{field.value}</span>
                          </div>
                        ) : (
                          "Select token"
                        )}
                        <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search token..." />
                        <CommandList>
                          <CommandEmpty>No token found.</CommandEmpty>
                          <CommandGroup>
                            {TOKENS.map((token) => (
                              <CommandItem
                                key={token}
                                value={token}
                                onSelect={() => {
                                  field.onChange(token)
                                  setToTokenOpen(false)
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value === token ? "opacity-100" : "opacity-0"
                                  )}
                                />
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
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
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
          <Button 
            type="submit" 
            form="swap-form" 
            disabled={!isValid || isLoading}
            className={cn(
              isValid && !isLoading && "swap-button-pulse",
              isLoading && "swap-button-pulse-fast"
            )}
          >
            {isLoading ? "Processing..." : "Swap"}
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
