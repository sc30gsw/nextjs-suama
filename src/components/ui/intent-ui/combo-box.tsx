'use client'

import { IconChevronLgDown, IconX } from '@intentui/icons'
import React, { type ComponentProps } from 'react'
import type {
  ComboBoxProps as ComboboxPrimitiveProps,
  InputProps,
  ListBoxProps,
  ValidationResult,
} from 'react-aria-components'
import {
  Button as ButtonPrimitive,
  ComboBoxContext,
  ComboBoxStateContext,
  ComboBox as ComboboxPrimitive,
  useSlottedContext,
} from 'react-aria-components'
import { Button } from '~/components/ui/intent-ui/button'
import { DropdownItem, DropdownLabel, DropdownSection } from '~/components/ui/intent-ui/dropdown'
import { Description, FieldError, FieldGroup, Input, Label } from '~/components/ui/intent-ui/field'
import { ListBox } from '~/components/ui/intent-ui/list-box'
import { PopoverContent, type PopoverContentProps } from '~/components/ui/intent-ui/popover'
import { composeTailwindRenderProps } from '~/lib/primitive'

interface ComboBoxProps<T extends object> extends Omit<ComboboxPrimitiveProps<T>, 'children'> {
  label?: string
  placeholder?: string
  description?: string | null
  errorMessage?: string | ((validation: ValidationResult) => string)
  children: React.ReactNode
}

const ComboBox = <T extends object>({
  label,
  description,
  errorMessage,
  children,
  className,
  ...props
}: ComboBoxProps<T>) => {
  return (
    <ComboboxPrimitive
      {...props}
      className={composeTailwindRenderProps(className, 'group flex w-full flex-col gap-y-1.5')}
    >
      {label && <Label>{label}</Label>}
      {children}
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
    </ComboboxPrimitive>
  )
}

interface ComboBoxListProps<T extends object>
  extends Omit<ListBoxProps<T>, 'layout' | 'orientation'>, Pick<PopoverContentProps, 'placement'> {
  popoverClassName?: PopoverContentProps['className']
}

const ComboBoxList = <T extends object>({
  children,
  items,
  className,
  popoverClassName,
  ...props
}: ComboBoxListProps<T>) => {
  return (
    <PopoverContent
      showArrow={false}
      isNonModal={true}
      className={popoverClassName}
      placement={props.placement}
    >
      <ListBox
        className={composeTailwindRenderProps(className, 'max-h-[inherit] border-0 shadow-none')}
        layout="stack"
        orientation="vertical"
        items={items}
        {...props}
      >
        {children}
      </ListBox>
    </PopoverContent>
  )
}

const ComboBoxInput = (props: InputProps) => {
  const context = useSlottedContext(ComboBoxContext)!
  const state = React.use(ComboBoxStateContext)

  const handleFocus: ComponentProps<typeof Input>['onFocus'] = (e) => {
    state?.open()
    props.onFocus?.(e)
  }

  const handleCompositionStart: ComponentProps<typeof Input>['onCompositionStart'] = (e) => {
    state?.open()
    props.onCompositionStart?.(e)
  }

  const handleCompositionUpdate: ComponentProps<typeof Input>['onCompositionUpdate'] = (e) => {
    state?.open()
    props.onCompositionUpdate?.(e)
  }

  return (
    <FieldGroup className="relative pl-0">
      <Input
        {...props}
        placeholder={props?.placeholder}
        onFocus={handleFocus}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
      />
      <Button
        square-petite="square-petite"
        intent="plain"
        className="h-7 w-8 rounded pressed:bg-transparent outline-offset-0 hover:bg-transparent active:bg-transparent **:data-[slot=icon]:pressed:text-fg **:data-[slot=icon]:text-muted-fg **:data-[slot=icon]:hover:text-fg"
      >
        {!context?.inputValue && (
          <IconChevronLgDown className="size-4 shrink-0 transition duration-200 group-open:rotate-180 group-open:text-fg" />
        )}
      </Button>
      {context?.inputValue && <ComboBoxClearButton />}
    </FieldGroup>
  )
}

const ComboBoxClearButton = () => {
  const state = React.use(ComboBoxStateContext)

  return (
    <ButtonPrimitive
      className="absolute inset-y-0 right-0 flex items-center pr-2 text-muted-fg hover:text-fg focus:outline-hidden"
      slot={null}
      aria-label="Clear"
      onPress={() => {
        state?.setSelectedKey(null)
        state?.open()
      }}
    >
      <IconX className="size-4 animate-in" />
    </ButtonPrimitive>
  )
}

const ComboBoxOption = DropdownItem
const ComboBoxLabel = DropdownLabel
const ComboBoxSection = DropdownSection

ComboBox.Input = ComboBoxInput
ComboBox.List = ComboBoxList
ComboBox.Option = ComboBoxOption
ComboBox.Label = ComboBoxLabel
ComboBox.Section = ComboBoxSection

export { ComboBox }
export type { ComboBoxListProps, ComboBoxProps }
