type FieldErrorType = {
	error: string
	field: string
}

export type CommonResponseType<D = {}> = {
	resultCode: number
	messages: Array<string>
	data: D
	fieldsErrors: FieldErrorType[]
}
