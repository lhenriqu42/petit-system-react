import { Environment } from '../../environment';
import { Api } from './axios-config';

const Autorization = () => {
	return {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
		}
	}
}

export enum EUserRole {
	Employee = 'employee',
	Admin = 'admin',
}

export interface IUser {
	id: number,
	name: string,
	email: string,
	role: EUserRole,
}

type TUserTotalCount = {
	data: IUser[],
	totalCount: number,
}

const getAll = async (page = 1, limit = Environment.LIMITE_DE_LINHAS): Promise<TUserTotalCount | Error> => {
	try {
		const urlRelativa = `/user?page=${page}&limit=${limit}`;
		const { data, headers } = await Api.get(urlRelativa, Autorization());
		if (data) {
			const new_data: IUser[] = data.map((usr: IUser) => ({ id: usr.id, name: usr.name, email: usr.email, role: usr.role == 'admin' ? 'Administrador' : 'Funcionário' }))
			return {
				data: new_data,
				totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
			};
		}

		return new Error('Erro ao listar os registros.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
	}
};

const deleteById = async (id: number): Promise<void | Error> => {
	try {
		await Api.delete(`/user/${id}`, Autorization());
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao apagar o registro.');
	}
};

const create = async (dados: { name: string, email: string, password: string, role: EUserRole }): Promise<number | Error> => {
	try {
		const { data } = await Api.post('/register', dados, Autorization());

		if (data) {
			return data.id;
		}

		return new Error('Erro ao criar o registro.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
	}
};

export const UserService = {
	create,
	getAll,
	deleteById,
}