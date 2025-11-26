'use client'

import { IconCalendarDays } from '@intentui/icons'
import type { DateDuration } from '@internationalized/date'
import type { Placement } from '@react-types/overlays'
import {
  DatePicker as DatePickerPrimitive,
  type DatePickerProps as DatePickerPrimitiveProps,
  DateRangePicker as DateRangePickerPrimitive,
  type DateRangePickerProps as DateRangePickerPrimitiveProps,
  type DateValue,
  type PopoverProps,
  type ValidationResult,
} from 'react-aria-components'
import { twJoin } from 'tailwind-merge'
import { Button } from '~/components/ui/intent-ui/button'
import { DateInput } from '~/components/ui/intent-ui/date-field'
import {
  Description,
  FieldError,
  FieldGroup,
  type FieldProps,
  Label,
} from '~/components/ui/intent-ui/field'
import { Modal } from '~/components/ui/intent-ui/modal'
import { PopoverContent } from '~/components/ui/intent-ui/popover'
import { JapaneseCalendar, JapaneseRangeCalendar } from '~/components/ui/japanese-calendar'
import { useMediaQuery } from '~/hooks/use-media-query'
import { composeTailwindRenderProps, cx } from '~/lib/primitive'

type JapaneseDatePickerOverlayProps = Omit<PopoverProps, 'children'> & {
  range?: boolean
  visibleDuration?: DateDuration
  pageBehavior?: 'visible' | 'single'
  isDateUnavailable?: (date: DateValue) => boolean
  onFocusChange?: (date: DateValue | false) => void
  isLoading?: boolean
}

export function JapaneseDatePickerOverlay({
  visibleDuration = { months: 1 },
  pageBehavior = 'visible',
  range,
  isDateUnavailable,
  onFocusChange,
  isLoading,
  ...props
}: JapaneseDatePickerOverlayProps) {
  const isMobile = useMediaQuery('(max-width: 767px)') ?? false

  return isMobile ? (
    <Modal.Content aria-label="Date picker" closeButton={false}>
      <div className="flex justify-center p-6">
        {range ? (
          <JapaneseRangeCalendar pageBehavior={pageBehavior} visibleDuration={visibleDuration} />
        ) : (
          <JapaneseCalendar
            isDateUnavailable={isDateUnavailable}
            onFocusChange={onFocusChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </Modal.Content>
  ) : (
    <PopoverContent
      showArrow={false}
      className={twJoin(
        'flex min-w-auto max-w-none snap-x justify-center p-4 sm:min-w-66 sm:p-2 sm:pt-3',
        visibleDuration?.months === 1 ? 'sm:max-w-2xs' : 'sm:max-w-none',
      )}
      {...props}
    >
      {range ? (
        <JapaneseRangeCalendar pageBehavior={pageBehavior} visibleDuration={visibleDuration} />
      ) : (
        <JapaneseCalendar
          isDateUnavailable={isDateUnavailable}
          onFocusChange={onFocusChange}
          isLoading={isLoading}
        />
      )}
    </PopoverContent>
  )
}

export function JapaneseDatePickerIcon() {
  return (
    <Button
      size="sq-sm"
      intent="plain"
      className="size-7 shrink-0 rounded pressed:bg-transparent outline-hidden outline-offset-0 hover:bg-transparent focus-visible:text-fg focus-visible:ring-0 group-open:text-fg **:data-[slot=icon]:text-muted-fg group-open:*:data-[slot=icon]:text-fg"
    >
      <IconCalendarDays />
    </Button>
  )
}

type JapaneseDatePickerProps<T extends DateValue> = DatePickerPrimitiveProps<T> &
  Pick<
    JapaneseDatePickerOverlayProps,
    'placement' | 'isDateUnavailable' | 'onFocusChange' | 'isLoading'
  > &
  Omit<FieldProps, 'placeholder'>

export function JapaneseDatePicker<T extends DateValue>({
  label,
  className,
  description,
  errorMessage,
  placement,
  isDateUnavailable,
  onFocusChange,
  isLoading,
  ...props
}: JapaneseDatePickerProps<T>) {
  return (
    <DatePickerPrimitive
      {...props}
      className={cx('group flex flex-col gap-y-1 *:data-[slot=label]:font-medium', className)}
    >
      {label && <Label>{label}</Label>}
      <FieldGroup className="min-w-40 *:[button]:last:mr-1.5 sm:*:[button]:last:mr-0.5">
        <DateInput className="w-full" />
        <JapaneseDatePickerIcon />
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <JapaneseDatePickerOverlay
        placement={placement}
        isDateUnavailable={isDateUnavailable}
        onFocusChange={onFocusChange}
        isLoading={isLoading}
      />
    </DatePickerPrimitive>
  )
}

export type JapaneseDateRangePickerProps<T extends DateValue> = DateRangePickerPrimitiveProps<T> & {
  label?: string
  description?: string
  errorMessage?: string | ((validation: ValidationResult) => string)
  visibleDuration?: DateDuration
  pageBehavior?: 'visible' | 'single'
  contentPlacement?: Placement
}

export function JapaneseDateRangePicker<T extends DateValue>({
  label,
  className,
  description,
  errorMessage,
  contentPlacement = 'bottom',
  visibleDuration = { months: 1 },
  ...props
}: JapaneseDateRangePickerProps<T>) {
  return (
    <DateRangePickerPrimitive
      {...props}
      className={composeTailwindRenderProps(
        className,
        'group/date-range-picker flex flex-col gap-y-1',
      )}
    >
      {label && <Label>{label}</Label>}
      <FieldGroup className="w-auto min-w-40">
        <DateInput slot="start" />
        <span
          aria-hidden="true"
          className="text-fg group-disabled:text-muted-fg forced-colors:text-[ButtonText] forced-colors:group-disabled:text-[GrayText]"
        >
          –
        </span>
        <DateInput className="pr-8" slot="end" />
        <JapaneseDatePickerIcon />
      </FieldGroup>
      {description && <Description>{description}</Description>}
      <FieldError>{errorMessage}</FieldError>
      <JapaneseDatePickerOverlay
        placement={contentPlacement}
        visibleDuration={visibleDuration}
        range={true}
      />
    </DateRangePickerPrimitive>
  )
}
