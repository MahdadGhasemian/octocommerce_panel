export type InputColumnFiltersModel = {
  id: string
  value: string | boolean | number
  operator?: string
}

export type InputSortingModel = {
  id: string
  desc: boolean
}

export function createParams(
  limit?: number,
  page?: number,
  search?: string,
  columnFilters?: InputColumnFiltersModel[],
  sorting?: InputSortingModel[]
) {
  return {
    limit: limit,
    page: page,
    search: search,

    // Spread sortBy
    ...sorting?.reduce((acc: { [x: string]: string }, obj: { id: string; desc: boolean }, index: any) => {
      acc[`sortBy[${index}]`] = `${obj.id}:${obj.desc ? 'DESC' : 'ASC'}`

      return acc
    }, {}),

    // Spread filter
    ...columnFilters?.reduce(
      (acc: { [x: string]: string }, obj: { id: string; value: string | boolean | number; operator?: string }) => {
        acc[`filter.${obj.id}`] = `${obj.operator ? obj.operator : '$ilike'}:${obj.value}`

        return acc
      },
      {}
    )
  }
}
