import { useQueryStates } from 'nuqs'
import { Description, Label } from '~/components/ui/intent-ui/field'
import { Radio, RadioGroup } from '~/components/ui/intent-ui/radio'

type SearchParamsParsers = Parameters<typeof useQueryStates>[0]

type UseQueryStatesReturn<T extends SearchParamsParsers> = ReturnType<typeof useQueryStates<T>>[0]

type FilterValue<T extends SearchParamsParsers, K extends keyof T> = UseQueryStatesReturn<T>[K]

type StringLiteralFilterKey<T extends SearchParamsParsers> = {
  [K in keyof T]: FilterValue<T, K> extends string ? K : never
}[keyof T]

export type FilterOption = Record<'value' | 'label' | 'description', string>

type SearchFilterRadioGroupProps<
  T extends SearchParamsParsers,
  K extends StringLiteralFilterKey<T>,
> = {
  parsers: T
  filterKey: K
  label: string
  options: readonly FilterOption[]
  defaultDescription: string
}

export function SearchFilterRadioGroup<
  T extends SearchParamsParsers,
  K extends StringLiteralFilterKey<T>,
>({ parsers, filterKey, label, options, defaultDescription }: SearchFilterRadioGroupProps<T, K>) {
  const [state, setState] = useQueryStates(parsers, {
    history: 'push',
    shallow: false,
  })

  const filterValue = state[filterKey] as FilterValue<T, K>
  const selectedOption = options.find((option) => option.value === filterValue) ?? options[0]

  const handleValueChange = (value: string) => {
    setState({
      [filterKey]: value as FilterValue<T, K>,
    } as Partial<UseQueryStatesReturn<T>>)
  }

  return (
    <div className="flex w-full flex-col gap-y-3">
      <Label>{label}</Label>
      <RadioGroup
        value={filterValue}
        onChange={handleValueChange}
        className="flex flex-col gap-y-3 space-y-0! md:flex-row md:gap-x-4 md:gap-y-0"
      >
        {options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
      <Description>{selectedOption?.description ?? defaultDescription}</Description>
    </div>
  )
}
