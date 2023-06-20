import { instance } from 'common/api/common.api';
import { CommonResponseType } from 'common/types/common.types';

export const authAPI = {
	login(data: LoginParamsType) {
		return instance.post<CommonResponseType<{ userId?: number }>>('auth/login', data);
	},
	logout() {
		return instance.delete<CommonResponseType<{ userId?: number }>>('auth/login');
	},
	me() {
		return instance.get<CommonResponseType<{ id: number; email: string; login: string }>>('auth/me')
	}
}

export type LoginParamsType = {
	email: string
	password: string
	rememberMe: boolean
	captcha?: string
}
