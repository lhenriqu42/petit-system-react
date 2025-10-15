import { Environment } from '../../environment';
import { urlBuilder } from '../formatters';
import { Api } from './axios-config';

const Autorization = () => {
	return {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
		}
	}
}

export interface ICreateBody {
	supplier_id: number;
	prods: { prod_id: number, quantity: number, price: number }[];
}

export interface IGetAllResponse {
	data: {
		id: number,
		supplier_id: number,
		total_value: number,
		created_at: Date,
		updated_at: Date,
		supplier_name: string,
	}[]
	totalCount: number;
}


const create = async (body: ICreateBody): Promise<number | Error> => {
	try {
		const { data } = await Api.post('/purchase', body, Autorization());

		if (data) {
			return data.id;
		}

		return new Error('Erro ao criar o registro.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao criar o registro.');
	}
};

const getAll = async (page = 1, limit = Environment.LIMITE_DE_LINHAS): Promise<IGetAllResponse | Error> => {
	try {
		const urlRelativa = urlBuilder('/purchase', { page, limit });
		const { data, headers } = await Api.get(urlRelativa, Autorization());
		if (data) {
			return {
				data,
				totalCount: Number(headers['x-total-count'] || Environment.LIMITE_DE_LINHAS),
			};
		}

		return new Error('Erro ao listar os registros.');
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao listar os registros.');
	}
};

export const PurchaseService = {
	create,
	getAll,
};