import { Api } from './axios-config';

const Autorization = () => {
	return {
		headers: {
			Authorization: `Bearer ${localStorage.getItem('APP_ACCESS_TOKEN')}`
		}
	}
}

export interface IRequestCreateBody {
	supplier_id: number,
	prod_id: number,
	pack_id?: number,
	supplier_prod_id: string,

	supplier_prod_code: string,
	supplier_prod_name: string,
}

const createOrUpdate = async (body: IRequestCreateBody): Promise<number> => {
	try {
		const { data } = await Api.post(`/supplier-prod-map`, body, Autorization());
		return data.id;
	} catch (error) {
		console.error(error);
		throw new Error((error as { message: string }).message || 'Erro ao atualizar o registro.');
	}
};

export const SupProdMapService = {
	createOrUpdate
};