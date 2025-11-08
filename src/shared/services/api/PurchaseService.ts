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


export interface IPurchaseCreateBody {
	supplier_id: number;
	purchases: {
		type: 'PACK' | 'PRODUCT';
		prod_id: number;
		pack_id?: number;			// only if type is PACK
		quantity: number;
		price: number;
	}[];
}

export interface IPurchaseGetAllResponse {
	data: {
		id: number,
		supplier_id: number,
		total_value: number,
		created_at: Date,
		updated_at: Date,
		effected: boolean,
		supplier_name: string,
	}[]
	totalCount: number;
}


const create = async (body: IPurchaseCreateBody): Promise<number | Error> => {
	body.purchases = body.purchases.map((item) => {
		const pack_id = item.type === 'PACK' ? item.pack_id : undefined;
		return {
			...item,
			pack_id,
		};
	});
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

const getAll = async (page = 1, limit = Environment.LIMITE_DE_LINHAS): Promise<IPurchaseGetAllResponse | Error> => {
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

interface IPurchaseDetails {
	id: number;
	supplier_id: number;
	total_value: number;
	effected: boolean;
	created_at: Date;
	updated_at: Date;
	details: {
		total_count: number;
		prod_list: {
			id: number,
			purchase_id: number,
			type: 'PACK' | 'PRODUCT',
			prod_id: number,
			prod_name: string,
			pack_id: number | null,
			quantity: number,
			price: number,
			pricetotal: number,
			created_at: Date,
			updated_at: Date,
		}[];
	};
}

const completePurchase = async (purchaseId: number): Promise<void | Error> => {
	try {
		await Api.put(`/purchase/complete/${purchaseId}`, {}, Autorization());
	} catch (error) {
		console.error(error);
		return new Error((error as { message: string }).message || 'Erro ao completar a compra.');
	}
};


export class GetDetailsError extends Error { constructor(message: string) { super(message); this.name = 'GetDetailsError'; } }
const getDetails = async (purchaseId?: number): Promise<IPurchaseDetails> => {
	if (!purchaseId) {
		throw new Error('ID da compra não fornecido.');
	}
	try {
		const urlRelativa = `/purchase/${purchaseId}`;
		const { data } = await Api.get(urlRelativa, Autorization());
		return data;
	} catch (error) {
		console.error(error);
		throw new GetDetailsError((error as { message: string }).message || 'Erro ao buscar os detalhes da compra.');
	}
};

const update = async (purchaseId: number, body: IPurchaseCreateBody): Promise<number> => {
	try {
		const { data } = await Api.put(`/purchase/${purchaseId}`, body, Autorization());
		return data.id;
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
	}
};

export const PurchaseService = {
	create,
	update,
	getAll,
	getDetails,
	completePurchase,
};